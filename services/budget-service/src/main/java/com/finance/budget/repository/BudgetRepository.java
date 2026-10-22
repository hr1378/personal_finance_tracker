package com.finance.budget.repository;

import com.finance.budget.model.Budget;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface BudgetRepository extends JpaRepository<Budget, UUID> {
    List<Budget> findByUserId(UUID userId);
    List<Budget> findByUserIdAndMonthAndYear(UUID userId, Integer month, Integer year);
}
