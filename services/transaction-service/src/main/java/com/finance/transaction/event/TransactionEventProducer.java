package com.finance.transaction.event;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Service;

@Service
public class TransactionEventProducer {

    private static final Logger logger = LoggerFactory.getLogger(TransactionEventProducer.class);
    private static final String TOPIC = "transactions";

    @Autowired
    private KafkaTemplate<String, Object> kafkaTemplate;

    public void publishTransactionEvent(TransactionEvent event) {
        try {
            kafkaTemplate.send(TOPIC, event.getUserId().toString(), event);
            logger.info("Published transaction event: {} for user: {}", event.getEventType(), event.getUserId());
        } catch (Exception e) {
            logger.error("Failed to publish transaction event", e);
        }
    }
}
