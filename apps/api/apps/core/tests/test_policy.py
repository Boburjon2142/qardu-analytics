from apps import policy


def test_policy_denies_everything_by_default():
    assert policy.can(object(), "anything") is False
    assert policy.can(None, "org.read", obj=object()) is False


class _Qs:
    def none(self):
        return "empty"


def test_scope_queryset_returns_nothing_by_default():
    assert policy.scope_queryset(object(), _Qs()) == "empty"
