package com.taskflow.websocket;

import java.util.UUID;

import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

import com.taskflow.websocket.dto.BoardEvent;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class BoardEventPublisher {

	private final SimpMessagingTemplate messagingTemplate;

	public void publish(UUID boardId, String type, Object payload) {
		messagingTemplate.convertAndSend(
			"/topic/board/" + boardId,
			new BoardEvent(type, boardId.toString(), payload)
		);
	}
}
