from rest_framework import serializers


class LoginSerializer(serializers.Serializer):
    email = serializers.EmailField(max_length=254)
    # No trimming (passwords may contain spaces); bounded to avoid hashing very long input.
    password = serializers.CharField(max_length=128, trim_whitespace=False, write_only=True)


def user_payload(user) -> dict:
    return {"id": user.pk, "email": user.email, "full_name": user.full_name}
