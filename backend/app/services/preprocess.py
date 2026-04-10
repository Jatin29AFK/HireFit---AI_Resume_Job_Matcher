import re
from functools import lru_cache
import spacy


@lru_cache(maxsize=1)
def get_nlp():
    return spacy.load("en_core_web_sm")


def clean_text(text: str) -> str:
    text = text.lower()
    text = re.sub(r"\s+", " ", text)
    text = re.sub(r"[^\w\s\-\+\#\.]", " ", text)
    return text.strip()


def lemmatize_text(text: str) -> str:
    nlp = get_nlp()
    doc = nlp(text)
    lemmas = [token.lemma_ for token in doc if not token.is_stop and not token.is_punct]
    return " ".join(lemmas)