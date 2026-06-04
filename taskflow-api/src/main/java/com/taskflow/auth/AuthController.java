package com.taskflow.auth;

import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.util.StringUtils;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.taskflow.auth.dto.AuthResponse;
import com.taskflow.auth.dto.LoginRequest;
import com.taskflow.auth.dto.RefreshRequest;
import com.taskflow.auth.dto.RegisterRequest;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/v1/auth")
@RequiredArgsConstructor
@Validated
public class AuthController {

	private final AuthService authService;

	@PostMapping("/register")
	public ResponseEntity<AuthResponse> register(@Valid @RequestBody RegisterRequest request) {
		return ResponseEntity.status(HttpStatus.CREATED).body(authService.register(request));
	}

	@PostMapping("/login")
	public ResponseEntity<AuthResponse> login(@Valid @RequestBody LoginRequest request) {
		return ResponseEntity.ok(authService.login(request));
	}

	@PostMapping("/refresh")
	public ResponseEntity<AuthResponse> refresh(
		@RequestHeader(value = HttpHeaders.AUTHORIZATION, required = false) String authorization,
		@RequestBody(required = false) RefreshRequest request
	) {
		String refreshToken = resolveRefreshToken(authorization, request);
		return ResponseEntity.ok(authService.refresh(refreshToken));
	}

	@PostMapping("/logout")
	public ResponseEntity<Void> logout(
		@RequestHeader(value = HttpHeaders.AUTHORIZATION, required = false) String authorization,
		@RequestBody(required = false) RefreshRequest request
	) {
		authService.logout(resolveRefreshToken(authorization, request));
		return ResponseEntity.noContent().build();
	}

	private String resolveRefreshToken(String authorization, RefreshRequest request) {
		if (request != null && StringUtils.hasText(request.refreshToken())) {
			return request.refreshToken();
		}
		if (StringUtils.hasText(authorization) && authorization.startsWith("Bearer ")) {
			return authorization.substring(7);
		}
		return null;
	}
}
