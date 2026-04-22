-- Recursive CTE: Full chart of accounts tree traversal
-- Returns all accounts with depth, path, and indented name for display

WITH RECURSIVE account_tree AS (
  -- Base case: root accounts (no parent)
  SELECT
    id, code, name, type, normal_balance, parent_id,
    is_leaf, depth, path,
    ARRAY[id] AS ancestors
  FROM accounts
  WHERE parent_id IS NULL AND is_active = true

  UNION ALL

  -- Recursive case: join children to their parent
  SELECT
    a.id, a.code, a.name, a.type, a.normal_balance, a.parent_id,
    a.is_leaf, at.depth + 1,
    at.path || ' > ' || a.name,
    at.ancestors || a.id
  FROM accounts a
  INNER JOIN account_tree at ON a.parent_id = at.id
  WHERE a.is_active = true
)
SELECT
  id, code, name, type, normal_balance,
  parent_id, is_leaf, depth, path,
  REPEAT('  ', depth) || name AS indented_name
FROM account_tree
ORDER BY path;
