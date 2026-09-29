# Working in Judge.me Product Reviews

This plugin targets Judge.me Product Reviews. The separate Judge.me Email app's
campaign/flow connector is not evidence of access to Product Reviews settings.
The plugin does not carry credentials or install a connection by itself.

## Select the available access

Use an authenticated Judge.me tool if it supports the exact operation. Read its
current schema and verify the target store. Otherwise use an available browser
session in the merchant's Judge.me Product Reviews dashboard. Follow that
browser tool's instructions, inspect current page state, and ground actions in
observed controls. A Shopify connection alone does not grant Judge.me access.

The [Product Reviews API guide](https://judge.me/help/en/articles/8409180-using-judge-me-api)
does not establish an email-template administration endpoint. Check current
documentation before choosing an API; use the dashboard for settings without
a documented supported operation. Do not invent an endpoint or bypass the UI
with undocumented network calls. Keep private API tokens in server-side secret
storage and out of plugin files, public variables, chat, and logs.

## Apply and verify the requested change

Read the current value and target record first. Explain the intended changes
briefly, then execute within the user's existing authorization; do not repeatedly
ask permission for ordinary edits already requested. Preserve unrelated fields.
Save, reopen the record or setting, and compare the persisted result with the
requested value. For an ambiguous mutation result, inspect the current state
before retrying to avoid duplicate replies, imports, or review requests.

Template changes, template activation, scheduling, and sending are different
actions. Carry out only the requested ones. General setup or plugin installation
does not authorize bulk email, messages to customers, paid upgrades, or deletion.
If an additional action needs authorization, prepare the concrete target/content
first and ask only for the missing decision.

If neither tools nor a browser can access the target, prepare the artifact or
exact settings that can be completed locally, identify the missing access, and
state that no live change occurred. Never ask the user to paste passwords or
private API tokens into chat. Report saved, activated, scheduled, sent, and
verified states separately when those distinctions matter.
