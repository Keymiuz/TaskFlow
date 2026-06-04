package com.taskflow.user.dto;

import java.time.LocalDateTime;
import java.util.UUID;

import com.taskflow.user.User;
import com.taskflow.user.UserRole;

public record UserResponse(
	UUID id,
	String name,
	String email,
	UserRole role,
	String avatarUrl,
	LocalDateTime createdAt,
	LocalDateTime updatedAt
) {
	public static UserResponse from(User user) {
		return new UserResponse(
			user.getId(),
			user.getName(),
			user.getEmail(),
			user.getRole(),
			user.getAvatarUrl(),
			user.getCreatedAt(),
			user.getUpdatedAt()
		);
	}
}
