"""Central authorization policy (RBAC + organization scope + object permission + confidentiality).

Milestone 2.1 ships only the deny-by-default shell. Rules arrive in 2.3. No view or serializer
may implement its own `if role == ...` checks; they must call into this module.
"""


def can(user, action: str, obj=None, at=None) -> bool:
    """Return True only if the policy explicitly allows. Currently denies everything."""
    return False


def scope_queryset(user, queryset):
    """Restrict a queryset to what `user` may see. Currently returns nothing."""
    return queryset.none()
