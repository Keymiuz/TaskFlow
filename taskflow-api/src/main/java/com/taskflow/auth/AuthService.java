package com.taskflow.auth;

import java.time.Instant;
import java.util.Locale;

import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import com.taskflow.auth.dto.AuthResponse;
import com.taskflow.auth.dto.LoginRequest;
import com.taskflow.auth.dto.RegisterRequest;
import com.taskflow.exception.UnauthorizedException;
import com.taskflow.user.User;
import com.taskflow.user.UserRepository;
import com.taskflow.user.UserRole;
import com.taskflow.user.dto.UserResponse;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
@Transactional
public class AuthService {

	private final UserRepository userRepository;
	private final PasswordEncoder passwordEncoder;
	private final JwtService jwtService;
	private final RefreshTokenService refreshTokenService;

	public AuthResponse register(RegisterRequest request) {
		String normalizedEmail = request.email().toLowerCase(Locale.ROOT);
		if (userRepository.existsByEmail(normalizedEmail)) {
			throw new ResponseStatusException(HttpStatus.CONFLICT, "Email already registered");
		}

		User user = User.builder()
			.name(request.name())
			.email(normalizedEmail)
			.password(passwordEncoder.encode(request.password()))
			.role(UserRole.MEMBER)
			.enabled(true)
			.build();

		User savedUser = userRepository.save(user);
		return issueTokens(savedUser);
	}

	public AuthResponse login(LoginRequest request) {
		User user = userRepository.findByEmail(request.email().toLowerCase(Locale.ROOT))
			.orElseThrow(() -> new UnauthorizedException("Invalid credentials"));

		if (!passwordEncoder.matches(request.password(), user.getPassword())) {
			throw new UnauthorizedException("Invalid credentials");
		}

		return issueTokens(user);
	}

	public AuthResponse refresh(String refreshToken) {
		if (refreshToken == null || refreshToken.isBlank()) {
			throw new UnauthorizedException("Refresh token is required");
		}
		if (!jwtService.isRefreshTokenValid(refreshToken)) {
			throw new UnauthorizedException("Refresh token is invalid");
		}

		java.util.UUID userId = refreshTokenService.consume(refreshToken);
		User user = userRepository.findById(userId)
			.orElseThrow(() -> new UnauthorizedException("User not found for refresh token"));

		return issueTokens(user);
	}

	public void logout(String refreshToken) {
		if (refreshToken == null || refreshToken.isBlank()) {
			throw new UnauthorizedException("Refresh token is required");
		}
		refreshTokenService.revoke(refreshToken);
	}

	private AuthResponse issueTokens(User user) {
		String accessToken = jwtService.generateAccessToken(user);
		String refreshToken = jwtService.generateRefreshToken(user);
		refreshTokenService.store(user.getId(), refreshToken, jwtService.getRefreshTokenExpiration());
		return AuthResponse.of(accessToken, refreshToken, UserResponse.from(user));
	}
}
