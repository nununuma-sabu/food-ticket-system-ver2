from backend import auth

def test_password_hash():
    password = "testpassword"
    hashed = auth.get_password_hash(password)
    assert hashed != password
    assert auth.verify_password(password, hashed) == True
    assert auth.verify_password("wrongpassword", hashed) == False

def test_create_access_token_default_expiry():
    token = auth.create_access_token({"sub": "test"})
    assert isinstance(token, str)
