package com.finance.dashboard.event;

import com.finance.transaction.event.TransactionEvent;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Service;

@Service
public class TransactionEventConsumer {

    private static final Logger logger = LoggerFactory.getLogger(TransactionEventConsumer.class);

    @KafkaListener(topics = "transactions", groupId = "dashboard-service-group")
    public void handleTransactionEvent(TransactionEvent event) {
        logger.info("Received transaction event: {} for user: {}", event.getEventType(), event.getUserId());

        // Invalidate dashboard cache for this user
        // The next dashboard request will fetch fresh data
        logger.info("Invalidating dashboard cache for user: {}", event.getUserId());
    }
}
