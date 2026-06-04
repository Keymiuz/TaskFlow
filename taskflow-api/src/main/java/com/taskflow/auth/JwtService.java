package com.taskflow.auth;

import java.nio.charset.StandardCharsets;
import java.time.Duration;
import java.time.Instant;
import java.util.Date;
import java.util.List;
import java.util.UUID;

import javax.crypto.SecretKey;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;

import com.taskflow.user.User;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;

@Service
public class JwtService {

	private static final Duration ACCESS_TOKEN_TTL = Duration.ofMinutes(15);
	private static final Duration REFRESH_TOKEN_TTL = Duration.ofDays(7);

	@Value("${jwt.secret}")
	private String secretKey;

	public String generateAccessToken(User user) {
		return buildToken(user, ACCESS_TOKEN_TTL);
	}

	public String generateRefreshToken(User user) {
		return buildToken(user, REFRESH_TOKEN_TTL);
	}

	public boolean isTokenValid(String token, UserDetails userDetails) {
		try {
			String username = extractUsername(token);
			return username.equals(userDetails.getUsername()) && !isTokenExpired(token);
		} catch (RuntimeException exception) {
			return false;
		}
	}

	public boolean isRefreshTokenValid(String token) {
		try {
			return "refresh".equals(extractType(token)) && !isTokenExpired(token);
		} catch (RuntimeException exception) {
			return false;
		}
	}

	public String extractUsername(String token) {
		return extractClaim(token, Claims::getSubject);
	}

	public UUID extractUserId(String token) {
		return UUID.fromString(extractClaim(token, claims -> claims.get("userId", String.class)));
	}

	public String extractRole(String token) {
		return extractClaim(token, claims -> claims.get("role", String.class));
	}

	public Instant getRefreshTokenExpiration() {
		return Instant.now().plus(REFRESH_TOKEN_TTL);
	}

	private String buildToken(User user, Duration ttl) {
		return Jwts.builder()
			.subject(user.getEmail())
			.claim("role", user.getRole().name())
			.claim("userId", user.getId().toString())
			.claim("type", ttl.equals(REFRESH_TOKEN_TTL) ? "refresh" : "access")
			.issuedAt(new Date())
			.expiration(Date.from(Instant.now().plus(ttl)))
			.signWith(getSigningKey())
			.compact();
	}

	private String extractType(String token) {
		return extractClaim(token, claims -> claims.get("type", String.class));
	}

	private <T> T extractClaim(String token, java.util.function.Function<Claims, T> resolver) {
		return resolver.apply(
			Jwts.parser()
				.verifyWith(getSigningKey())
				.build()
				.parseSignedClaims(token)
				.getPayload()
		);
	}

	private SecretKey getSigningKey() {
		byte[] decodedKey = Decoders.BASE64.decode(secretKey);
		return Keys.hmacShaKeyFor(decodedKey);
	}

	private boolean isTokenExpired(String token) {
		return extractClaim(token, Claims::getExpiration).before(Date.from(Instant.now()));
	}
}
