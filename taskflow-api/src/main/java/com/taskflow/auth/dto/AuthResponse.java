package com.taskflow.auth.dto;

import com.taskflow.user.dto.UserResponse;

public record AuthResponse(
	String accessToken,
	String refreshToken,
	UserResponse user
) {
	public static AuthResponse of(String accessToken, String refreshToken, UserResponse user) {
		return new AuthResponse(accessToken, refreshToken, user);
	}
}
