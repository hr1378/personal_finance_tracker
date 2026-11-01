package com.finance.budget.event;

import com.finance.transaction.event.TransactionEvent;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Service;

@Service
public class TransactionEventConsumer {

    private static final Logger logger = LoggerFactory.getLogger(TransactionEventConsumer.class);

    @KafkaListener(topics = "transactions", groupId = "budget-service-group")
    public void handleTransactionEvent(TransactionEvent event) {
        logger.info("Received transaction event: {} for user: {}", event.getEventType(), event.getUserId());

        if ("CREATED".equals(event.getEventType()) || "UPDATED".equals(event.getEventType())) {
            // Invalidate budget cache for this user
            // The next budget calculation will fetch fresh data
            logger.info("Invalidating budget cache for user: {}", event.getUserId());
        }
    }
}
