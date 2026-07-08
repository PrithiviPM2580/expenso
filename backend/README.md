# backend

To install dependencies:

```bash
bun install
```

To run:

```bash
bun run index.ts
```

This project was created using `bun init` in bun v1.3.13. [Bun](https://bun.com) is a fast all-in-one JavaScript runtime.

export const getBudgets = async (
req: Request,
res: Response,
next: NextFunction,
) => {
const budgets = await prisma.budget.findMany({
where: {
userId: req.user!.id,
},
include: {
category: {
select: {
id: true,
name: true,
icon: true,
color: true,
},
},
},
orderBy: {
category: {
name: "asc",
},
},
});

const budgetsWithSpending = await Promise.all(
budgets.map(async (budget) => {
const startDate = getPeriodStartDate(budget.period);

      const spending = await prisma.transaction.aggregate({
        _sum: {
          amount: true,
        },
        where: {
          userId: req.user!.id,
          categoryId: budget.categoryId,
          type: "expense",
          transactionDate: {
            gte: startDate,
          },
        },
      });

      return {
        ...budget,
        spent: spending._sum.amount ?? 0,
      };
    }),

);

return res.status(200).json({
status: "success",
data: {
budgets: budgetsWithSpending,
},
});
};

const getPeriodStartDate = (period: string) => {
const now = new Date();

switch (period) {
case "month":
return new Date(
now.getFullYear(),
now.getMonth(),
1,
);

    case "week":
      const day = now.getDay();

      return new Date(
        now.getFullYear(),
        now.getMonth(),
        now.getDate() - day,
      );

    case "year":
      return new Date(
        now.getFullYear(),
        0,
        1,
      );

    default:
      return new Date(
        now.getFullYear(),
        now.getMonth(),
        1,
      );

}
};
