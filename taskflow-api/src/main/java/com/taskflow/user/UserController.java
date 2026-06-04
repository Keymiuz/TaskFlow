package com.taskflow.user;

import java.util.List;
import java.util.UUID;

import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.taskflow.user.dto.UpdateRoleRequest;
import com.taskflow.user.dto.UpdateUserRequest;
import com.taskflow.user.dto.UserResponse;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/v1/users")
@RequiredArgsConstructor
public class UserController {

	private final UserService userService;

	@GetMapping
	@PreAuthorize("hasRole('ADMIN')")
	public List<UserResponse> listAll() {
		return userService.listAll();
	}

	@GetMapping("/me")
	public UserResponse me(@AuthenticationPrincipal UserDetails userDetails) {
		return userService.findByEmail(userDetails.getUsername());
	}

	@PatchMapping("/me")
	public UserResponse updateMe(
		@AuthenticationPrincipal UserDetails userDetails,
		@Valid @RequestBody UpdateUserRequest request
	) {
		return userService.updateMe(userDetails.getUsername(), request);
	}

	@PatchMapping("/{id}/role")
	@PreAuthorize("hasRole('ADMIN')")
	public UserResponse changeRole(
		@PathVariable UUID id,
		@Valid @RequestBody UpdateRoleRequest request
	) {
		return userService.updateRole(id, request.role());
	}
}
