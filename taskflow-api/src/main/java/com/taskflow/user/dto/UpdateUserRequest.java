package com.taskflow.user.dto;

import jakarta.validation.constraints.NotBlank;

public record UpdateUserRequest(
	@NotBlank String name,
	String avatarUrl
) {
}
