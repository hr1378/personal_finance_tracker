package com.finance.budget.client;

import com.finance.budget.dto.TransactionSummaryResponse;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.service.annotation.GetExchange;

import java.util.List;

public interface TransactionClient {

    @GetExchange("/api/transactions")
    List<TransactionSummaryResponse> getAllTransactions(@RequestParam("userId") UUID userId);
}
