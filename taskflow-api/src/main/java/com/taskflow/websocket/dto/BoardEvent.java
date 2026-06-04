package com.taskflow.websocket.dto;

public record BoardEvent(
	String type,
	String boardId,
	Object payload
) {
}
