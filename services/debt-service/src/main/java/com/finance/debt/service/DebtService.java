package com.finance.debt.service;

import com.finance.debt.dto.DebtPaymentRequest;
import com.finance.debt.dto.DebtRequest;
import com.finance.debt.model.Debt;
import com.finance.debt.model.DebtPayment;
import com.finance.debt.repository.DebtPaymentRepository;
import com.finance.debt.repository.DebtRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Service
@Transactional
public class DebtService {

    private final DebtRepository debtRepository;
    private final DebtPaymentRepository debtPaymentRepository;

    public DebtService(DebtRepository debtRepository, DebtPaymentRepository debtPaymentRepository) {
        this.debtRepository = debtRepository;
        this.debtPaymentRepository = debtPaymentRepository;
    }

    public Debt createDebt(DebtRequest request) {
        Debt debt = new Debt();
        debt.setUserId(request.getUserId());
        debt.setName(request.getName());
        debt.setOriginalBalance(request.getOriginalBalance());
        debt.setCurrentBalance(request.getCurrentBalance());
        debt.setApr(request.getApr());
        debt.setMinimumPayment(request.getMinimumPayment());
        debt.setDueDate(request.getDueDate());
        return debtRepository.save(debt);
    }

    public List<Debt> getDebtsByUser(UUID userId) {
        return debtRepository.findByUserId(userId);
    }

    public Debt getDebtById(UUID id) {
        return debtRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Debt not found"));
    }

    public Debt updateDebt(UUID id, DebtRequest request) {
        Debt debt = getDebtById(id);
        debt.setName(request.getName());
        debt.setCurrentBalance(request.getCurrentBalance());
        debt.setApr(request.getApr());
        debt.setMinimumPayment(request.getMinimumPayment());
        debt.setDueDate(request.getDueDate());
        debt.setUpdatedAt(LocalDateTime.now());
        return debtRepository.save(debt);
    }

    public void deleteDebt(UUID id) {
        if (!debtRepository.existsById(id)) {
            throw new RuntimeException("Debt not found");
        }
        debtRepository.deleteById(id);
    }

    public DebtPayment createPayment(DebtPaymentRequest request) {
        DebtPayment payment = new DebtPayment();
        payment.setUserId(request.getUserId());
        payment.setDebtId(request.getDebtId());
        payment.setAmount(request.getAmount());
        payment.setPaymentDate(request.getPaymentDate());
        payment.setNote(request.getNote());

        DebtPayment savedPayment = debtPaymentRepository.save(payment);

        // Update debt balance
        Debt debt = getDebtById(request.getDebtId());
        debt.setCurrentBalance(debt.getCurrentBalance().subtract(request.getAmount()));
        debt.setUpdatedAt(LocalDateTime.now());
        debtRepository.save(debt);

        return savedPayment;
    }

    public List<DebtPayment> getPaymentsByDebt(UUID debtId) {
        return debtPaymentRepository.findByDebtId(debtId);
    }

    public List<DebtPayment> getPaymentsByUser(UUID userId) {
        return debtPaymentRepository.findByUserId(userId);
    }

    public BigDecimal calculateProgress(UUID debtId) {
        Debt debt = getDebtById(debtId);
        if (debt.getOriginalBalance().compareTo(BigDecimal.ZERO) == 0) {
            return BigDecimal.ZERO;
        }
        BigDecimal paid = debt.getOriginalBalance().subtract(debt.getCurrentBalance());
        return paid.divide(debt.getOriginalBalance(), 4, java.math.RoundingMode.HALF_UP)
                .multiply(BigDecimal.valueOf(100));
    }
}
