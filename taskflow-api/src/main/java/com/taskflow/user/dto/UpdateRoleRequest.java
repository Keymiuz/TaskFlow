package com.taskflow.user.dto;

import jakarta.validation.constraints.NotNull;

import com.taskflow.user.UserRole;

public record UpdateRoleRequest(
	@NotNull UserRole role
) {
}
