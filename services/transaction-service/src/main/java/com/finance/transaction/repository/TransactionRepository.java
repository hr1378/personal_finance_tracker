package com.finance.transaction.repository;

import com.finance.transaction.model.Transaction;
import com.finance.transaction.model.TransactionType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@Repository
public interface TransactionRepository extends JpaRepository<Transaction, UUID> {

    List<Transaction> findByUserId(UUID userId);

    List<Transaction> findByType(TransactionType type);

    List<Transaction> findByTypeAndDateBetween(TransactionType type, LocalDate startDate, LocalDate endDate);

    List<Transaction> findByDateBetween(LocalDate startDate, LocalDate endDate);
}
