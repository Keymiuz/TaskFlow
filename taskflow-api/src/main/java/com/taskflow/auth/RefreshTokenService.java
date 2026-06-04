package com.taskflow.auth;

import java.time.Instant;
import java.util.UUID;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.taskflow.exception.UnauthorizedException;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class RefreshTokenService {

	private final RefreshTokenRepository refreshTokenRepository;

	@Transactional
	public RefreshToken store(UUID userId, String token, Instant expiresAt) {
		RefreshToken refreshToken = RefreshToken.builder()
			.userId(userId)
			.token(token)
			.expiresAt(expiresAt)
			.build();
		return refreshTokenRepository.save(refreshToken);
	}

	@Transactional
	public UUID consume(String token) {
		RefreshToken refreshToken = refreshTokenRepository.findByToken(token)
			.orElseThrow(() -> new UnauthorizedException("Refresh token is invalid"));

		if (refreshToken.getRevokedAt() != null) {
			throw new UnauthorizedException("Refresh token was already used");
		}

		if (refreshToken.getExpiresAt().isBefore(Instant.now())) {
			throw new UnauthorizedException("Refresh token expired");
		}

		refreshToken.setRevokedAt(Instant.now());
		refreshTokenRepository.save(refreshToken);
		return refreshToken.getUserId();
	}

	@Transactional
	public void revoke(String token) {
		refreshTokenRepository.findByToken(token).ifPresent(refreshToken -> {
			if (refreshToken.getRevokedAt() == null) {
				refreshToken.setRevokedAt(Instant.now());
				refreshTokenRepository.save(refreshToken);
			}
		});
	}

	@Transactional
	public void revokeAllForUser(UUID userId) {
		refreshTokenRepository.findAllByUserIdAndRevokedAtIsNull(userId).forEach(refreshToken -> {
			refreshToken.setRevokedAt(Instant.now());
			refreshTokenRepository.save(refreshToken);
		});
	}
}
