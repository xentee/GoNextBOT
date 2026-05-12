const fs = require('fs');
const path = require('path');
const { randomUUID } = require('crypto');
const { DatabaseSync } = require('node:sqlite');

const databasePath = path.join(__dirname, '..', 'data.sqlite');
const legacyBalancesPath = path.join(__dirname, '..', 'balances.json');

let db;

function getDatabase() {
    if (!db) {
        db = new DatabaseSync(databasePath);
        db.exec('PRAGMA journal_mode = WAL;');
        db.exec('PRAGMA foreign_keys = ON;');
    }

    return db;
}

function initDatabase() {
    const database = getDatabase();

    database.exec(`
        CREATE TABLE IF NOT EXISTS balances (
            user_id TEXT PRIMARY KEY,
            balance INTEGER NOT NULL DEFAULT 0,
            updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
        );

        CREATE TABLE IF NOT EXISTS transactions (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            batch_id TEXT,
            type TEXT NOT NULL,
            actor_id TEXT NOT NULL,
            target_id TEXT,
            amount INTEGER,
            balance_after INTEGER,
            metadata TEXT,
            created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
        );

        CREATE INDEX IF NOT EXISTS idx_transactions_target_id ON transactions(target_id);
        CREATE INDEX IF NOT EXISTS idx_transactions_batch_id ON transactions(batch_id);
        CREATE INDEX IF NOT EXISTS idx_transactions_created_at ON transactions(created_at);
    `);

    migrateLegacyBalances(database);
}

function migrateLegacyBalances(database) {
    if (!fs.existsSync(legacyBalancesPath)) return;

    const row = database.prepare('SELECT COUNT(*) AS count FROM balances').get();
    if (row.count > 0) return;

    const raw = fs.readFileSync(legacyBalancesPath, 'utf8');
    const balances = JSON.parse(raw);

    const insert = database.prepare(`
        INSERT INTO balances (user_id, balance, updated_at)
        VALUES (?, ?, CURRENT_TIMESTAMP)
    `);

    runInTransaction(() => {
        const entries = Object.entries(balances);

        for (const [userId, balance] of entries) {
            if (Number.isSafeInteger(balance)) {
                insert.run(userId, balance);
            }
        }
    });
}

function runInTransaction(callback) {
    const database = getDatabase();

    database.exec('BEGIN IMMEDIATE;');
    try {
        const result = callback();
        database.exec('COMMIT;');
        return result;
    } catch (error) {
        database.exec('ROLLBACK;');
        throw error;
    }
}

function getBalance(userId) {
    const row = getDatabase()
        .prepare('SELECT balance FROM balances WHERE user_id = ?')
        .get(userId);

    return row?.balance || 0;
}

function setBalance(userId, balance) {
    getDatabase()
        .prepare(`
            INSERT INTO balances (user_id, balance, updated_at)
            VALUES (?, ?, CURRENT_TIMESTAMP)
            ON CONFLICT(user_id) DO UPDATE SET
                balance = excluded.balance,
                updated_at = CURRENT_TIMESTAMP
        `)
        .run(userId, balance);
}

function addTransaction({ batchId = null, type, actorId, targetId = null, amount = null, balanceAfter = null, metadata = {} }) {
    getDatabase()
        .prepare(`
            INSERT INTO transactions (batch_id, type, actor_id, target_id, amount, balance_after, metadata)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        `)
        .run(batchId, type, actorId, targetId, amount, balanceAfter, JSON.stringify(metadata));
}

function addBalance({ userId, amount, actorId, type, metadata = {}, batchId = null }) {
    let nextBalance;

    runInTransaction(() => {
        const currentBalance = getBalance(userId);
        nextBalance = currentBalance + amount;
        setBalance(userId, nextBalance);
        addTransaction({ batchId, type, actorId, targetId: userId, amount, balanceAfter: nextBalance, metadata });
    });

    return nextBalance;
}

function removeBalance({ userId, amount, actorId, metadata = {} }) {
    let nextBalance;

    runInTransaction(() => {
        const currentBalance = getBalance(userId);
        if (currentBalance < amount) {
            throw new Error('INSUFFICIENT_BALANCE');
        }

        nextBalance = currentBalance - amount;
        setBalance(userId, nextBalance);
        addTransaction({ type: 'removebal', actorId, targetId: userId, amount: -amount, balanceAfter: nextBalance, metadata });
    });

    return nextBalance;
}

function clearBalance({ userId, actorId, metadata = {} }) {
    runInTransaction(() => {
        const previousBalance = getBalance(userId);
        setBalance(userId, 0);
        addTransaction({ type: 'clearbal', actorId, targetId: userId, amount: -previousBalance, balanceAfter: 0, metadata });
    });
}

function payout({ actorId, recipients, sharePerMember, metadata }) {
    const batchId = randomUUID();

    runInTransaction(() => {
        for (const recipient of recipients) {
            const currentBalance = getBalance(recipient.id);
            const nextBalance = currentBalance + sharePerMember;
            setBalance(recipient.id, nextBalance);
            addTransaction({
                batchId,
                type: 'payout',
                actorId,
                targetId: recipient.id,
                amount: sharePerMember,
                balanceAfter: nextBalance,
                metadata,
            });
        }
    });

    return batchId;
}

function getTopBalances(limit = 10) {
    return getDatabase()
        .prepare('SELECT user_id, balance FROM balances ORDER BY balance DESC LIMIT ?')
        .all(limit);
}

function getHistory(userId, limit = 10, offset = 0) {
    return getDatabase()
        .prepare(`
            SELECT * FROM transactions
            WHERE target_id = ?
            ORDER BY id DESC
            LIMIT ? OFFSET ?
        `)
        .all(userId, limit, offset);
}

function countHistory(userId) {
    const row = getDatabase()
        .prepare('SELECT COUNT(*) AS count FROM transactions WHERE target_id = ?')
        .get(userId);

    return row.count;
}

function getLastPayout() {
    const row = getDatabase()
        .prepare(`
            SELECT batch_id
            FROM transactions
            WHERE type = 'payout'
            ORDER BY id DESC
            LIMIT 1
        `)
        .get();

    if (!row?.batch_id) return [];

    return getDatabase()
        .prepare(`
            SELECT * FROM transactions
            WHERE batch_id = ?
            ORDER BY id ASC
        `)
        .all(row.batch_id);
}

module.exports = {
    initDatabase,
    getBalance,
    addBalance,
    removeBalance,
    clearBalance,
    payout,
    getTopBalances,
    getHistory,
    countHistory,
    getLastPayout,
};
