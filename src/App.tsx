import { Fragment, useCallback, useEffect, useMemo, useState } from "react"
import { InputSelect } from "./components/InputSelect"
import { Instructions } from "./components/Instructions"
import { Transactions } from "./components/Transactions"
import { useEmployees } from "./hooks/useEmployees"
import { usePaginatedTransactions } from "./hooks/usePaginatedTransactions"
import { useTransactionsByEmployee } from "./hooks/useTransactionsByEmployee"
import { EMPTY_EMPLOYEE } from "./utils/constants"
import { Employee } from "./utils/types"

export function App() {
  const { data: employees, ...employeeUtils } = useEmployees()
  const { data: paginatedTransactions, ...paginatedTransactionsUtils } = usePaginatedTransactions()
  const { data: transactionsByEmployee, ...transactionsByEmployeeUtils } = useTransactionsByEmployee()
  const [isLoading, setIsLoading] = useState(false)
  const [isHidden, setIsHidden] = useState(false)
  const [approvalState, setApprovalState] = useState<{ [key: string]: boolean }>({});


  const handleApprovalToggle = (transactionId: string, approved: boolean) => {
    setApprovalState((prevState) => ({ ...prevState, [transactionId]: approved }));
  };


  const transactions = useMemo(
    () => paginatedTransactions?.data ?? transactionsByEmployee ?? null,
    [paginatedTransactions, transactionsByEmployee]
  )

  const loadAllTransactions = useCallback(async () => {
    setIsLoading(true)
    transactionsByEmployeeUtils.invalidateData()

    await employeeUtils.fetchAll()
    setIsLoading(false)
    await paginatedTransactionsUtils.fetchAll()


  }, [employeeUtils, paginatedTransactionsUtils, transactionsByEmployeeUtils])

  const loadMoreTransactions = useCallback(async () => {
    await paginatedTransactionsUtils.fetchMore();
    console.log(paginatedTransactions,'HEYYY')
    if (paginatedTransactions?.nextPage === null) {
      setIsHidden(true);
    }
  }, [paginatedTransactionsUtils]);

  const loadTransactionsByEmployee = useCallback(
    async (employeeId: string) => {
      paginatedTransactionsUtils.invalidateData()
      await transactionsByEmployeeUtils.fetchById(employeeId)
    },
    [paginatedTransactionsUtils, transactionsByEmployeeUtils]
  )



  useEffect(() => {
    if (employees === null && !employeeUtils.loading) {
      loadAllTransactions()
    }
  }, [employeeUtils.loading, employees, loadAllTransactions])


  return (
    <Fragment>
      <main className="MainContainer">
        <Instructions />

        <hr className="RampBreak--l" />

        <InputSelect<Employee>
          isLoading={isLoading}
          defaultValue={EMPTY_EMPLOYEE}
          items={employees === null ? [] : [EMPTY_EMPLOYEE, ...employees]}
          label="Filter by employee"
          loadingLabel="Loading employees"
          parseItem={(item) => ({
            value: item.id,
            label: `${item.firstName} ${item.lastName}`,
          })}
          onChange={async (newValue) => {
            if (newValue === null) {
              return
            } else if (!!newValue.id) {
              await loadTransactionsByEmployee(newValue.id)
              setIsHidden(true)
            }
              else {
                await loadAllTransactions()
                setIsHidden(false)
            }
          }}

        />

        <div className="RampBreak--l" />

        <div className="RampGrid">
          <Transactions
          transactions={transactions} />

          {transactions !== null && (
            <button
              className="RampButton"
              hidden={isHidden}
              disabled={paginatedTransactionsUtils.loading}
              onClick={async () => {
                await loadMoreTransactions()
              }}
            >
              View More
            </button>
          )}
        </div>
      </main>
    </Fragment>
  )
}
