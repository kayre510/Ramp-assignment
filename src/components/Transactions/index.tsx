import { useCallback, useState } from "react";
import { useCustomFetch } from "src/hooks/useCustomFetch";
import { SetTransactionApprovalParams } from "src/utils/types";
import { TransactionPane } from "./TransactionPane";
import { SetTransactionApprovalFunction, TransactionsComponent } from "./types";

export const Transactions: TransactionsComponent = ({ transactions }) => {
  const { fetchWithoutCache, loading } = useCustomFetch();

  const [approvedTransactions, setApprovedTransactions] = useState(new Map());

  const setTransactionApproval = useCallback<SetTransactionApprovalFunction>(
    async ({ transactionId, newValue }) => {
      await fetchWithoutCache<void, SetTransactionApprovalParams>(
        "setTransactionApproval",
        {
          transactionId,
          value: newValue,
        }
      );

      setApprovedTransactions((prevApprovedTransactions) => {
        const updatedApprovedTransactions = new Map(prevApprovedTransactions);
        updatedApprovedTransactions.set(transactionId, newValue);
        return updatedApprovedTransactions;
      });
    },
    [fetchWithoutCache]
  );

  if (transactions === null) {
    return <div className="RampLoading--container">Loading...</div>;
  }

  return (
    <div data-testid="transaction-container">
      {transactions.map((transaction) => (
        <TransactionPane
          key={transaction.id}
          transaction={transaction}
          loading={loading}
          setTransactionApproval={setTransactionApproval}
          approved={approvedTransactions.get(transaction.id) || false}
        />
      ))}
    </div>
  );
};

