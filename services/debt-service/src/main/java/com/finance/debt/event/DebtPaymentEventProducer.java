package com.finance.debt.event;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Service;

@Service
public class DebtPaymentEventProducer {

    private static final Logger logger = LoggerFactory.getLogger(DebtPaymentEventProducer.class);
    private static final String TOPIC = "debt-payments";

    @Autowired
    private KafkaTemplate<String, Object> kafkaTemplate;

    public void publishDebtPaymentEvent(DebtPaymentEvent event) {
        try {
            kafkaTemplate.send(TOPIC, event.getUserId().toString(), event);
            logger.info("Published debt payment event: {} for user: {}", event.getEventType(), event.getUserId());
        } catch (Exception e) {
            logger.error("Failed to publish debt payment event", e);
        }
    }
}
