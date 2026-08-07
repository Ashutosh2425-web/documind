from django.test import TestCase
from .chunking import chunk_text
from .prompt_builder import build_prompt


class ChunkingTests(TestCase):
    def test_chunk_count(self):
        text = "A" * 2500
        chunks = chunk_text(text, chunk_size=1000, overlap=200)
        self.assertEqual(len(chunks), 4)

    def test_chunk_overlap(self):
        text = "A" * 2500
        chunks = chunk_text(text, chunk_size=1000, overlap=200)
        # last 200 chars of chunk 0 should match first 200 chars of chunk 1
        self.assertEqual(chunks[0][-200:], chunks[1][:200])

    def test_empty_text(self):
        chunks = chunk_text("", chunk_size=1000, overlap=200)
        self.assertEqual(len(chunks), 0)


class PromptBuilderTests(TestCase):
    def test_prompt_contains_question(self):
        prompt = build_prompt("What is Django?", ["Django is a web framework."])
        self.assertIn("What is Django?", prompt)

    def test_prompt_contains_chunks(self):
        prompt = build_prompt("test question", ["chunk A content", "chunk B content"])
        self.assertIn("chunk A content", prompt)
        self.assertIn("chunk B content", prompt)

    def test_prompt_has_no_history_section_when_none_given(self):
        prompt = build_prompt("test question", ["some chunk"])
        self.assertNotIn("Previous conversation", prompt)