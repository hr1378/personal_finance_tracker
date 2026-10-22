package com.finance.debt.repository;

import com.finance.debt.model.DebtPayment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface DebtPaymentRepository extends JpaRepository<DebtPayment, UUID> {
    List<DebtPayment> findByDebtId(UUID debtId);
    List<DebtPayment> findByUserId(UUID userId);
}
