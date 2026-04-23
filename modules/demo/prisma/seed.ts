import { PrismaClient } from "../src/generated/client.ts";
import { PrismaNeon } from "@prisma/adapter-neon";

const adapter = new PrismaNeon({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

const seedTodos = [
    { id: "seed-01", title: "Buy milk", description: "2% organic", completed: false },
    { id: "seed-02", title: "Walk the dog", description: null, completed: true },
    { id: "seed-03", title: "Finish POC", description: "Wire Todos to Neon via Prisma", completed: false },
    { id: "seed-04", title: "Book dentist appointment", description: null, completed: false },
    { id: "seed-05", title: "Review pull requests", description: "Focus on auth module", completed: true },
    { id: "seed-06", title: "Pay credit card bill", description: null, completed: true },
    { id: "seed-07", title: "Prepare demo slides", description: "Q2 all-hands", completed: false },
    { id: "seed-08", title: "Call plumber", description: "Kitchen sink leak", completed: false },
    { id: "seed-09", title: "Read TanStack Router v2 RFC", description: null, completed: false },
    { id: "seed-10", title: "Reply to Sarah's email", description: null, completed: true },
    { id: "seed-11", title: "Pick up dry cleaning", description: null, completed: false },
    { id: "seed-12", title: "Renew passport", description: "Expires in October", completed: false },
    { id: "seed-13", title: "Schedule 1:1 with manager", description: null, completed: true },
    { id: "seed-14", title: "Migrate database to Neon", description: "Switch from local Postgres", completed: true },
    { id: "seed-15", title: "Write blog post on Vite 8", description: "Rolldown migration notes", completed: false },
    { id: "seed-16", title: "Order birthday gift for mom", description: null, completed: false },
    { id: "seed-17", title: "Refactor breadcrumb logic", description: "Move out of TodosLayout", completed: false },
    { id: "seed-18", title: "Cancel unused subscriptions", description: "Audit monthly charges", completed: false },
    { id: "seed-19", title: "Update LinkedIn profile", description: null, completed: true },
    { id: "seed-20", title: "Backup personal laptop", description: null, completed: false },
    { id: "seed-21", title: "Run Lighthouse audit", description: "Check LCP on /todos", completed: false },
    { id: "seed-22", title: "Grocery shopping", description: "Weekend meal prep", completed: false },
    { id: "seed-23", title: "Fix flaky E2E test", description: "TodoEdit form submission", completed: true },
    { id: "seed-24", title: "Take out recycling", description: null, completed: true },
    { id: "seed-25", title: "Submit expense report", description: "Conference travel", completed: false },
    { id: "seed-26", title: "Research React Server Components", description: null, completed: false },
    { id: "seed-27", title: "Water the plants", description: null, completed: false },
    { id: "seed-28", title: "Review Q3 roadmap draft", description: null, completed: true },
    { id: "seed-29", title: "Upgrade Node to 24 LTS", description: "Across all workspaces", completed: false },
    { id: "seed-30", title: "Plan team offsite", description: "Early November", completed: false }
];

async function main() {
    const results = await Promise.all(
        seedTodos.map(todo =>
            prisma.todo.upsert({
                where: { id: todo.id },
                update: {},
                create: todo
            })
        )
    );

    console.log(`Seeded ${results.length} todos`);
}

main()
    // oxlint-disable-next-line no-unused-vars
    .catch(e => {
        console.error(e);

        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
