from django.core.management.base import BaseCommand

from core.models import Document
from core.chunking import chunk_text
from core.embeddings import generate_embeddings
from core.vectorstore import add_chunks_to_store, collection


class Command(BaseCommand):
    help = "Re-index existing documents that are missing from ChromaDB."

    def handle(self, *args, **options):

        documents = Document.objects.all().order_by("id")

        total_documents = documents.count()
        indexed_count = 0
        skipped_count = 0
        failed_count = 0

        self.stdout.write(
            self.style.SUCCESS(
                f"\nFound {total_documents} documents.\n"
            )
        )

        for document in documents:

            self.stdout.write(
                f"Processing document {document.id}: "
                f"{document.original_filename}"
            )

            try:
                existing = collection.get(
                    where={
                        "document_id": document.id
                    },
                    include=["metadatas"]
                )

                existing_count = len(
                    existing.get("ids", [])
                )

                if existing_count > 0:

                    self.stdout.write(
                        self.style.WARNING(
                            f" -> Already indexed "
                            f"({existing_count} chunks)"
                        )
                    )

                    skipped_count += 1
                    continue

                extracted_text = document.extracted_text or ""

                if not extracted_text.strip():

                    self.stdout.write(
                        self.style.WARNING(
                            " -> Skipped: no extracted text"
                        )
                    )

                    skipped_count += 1
                    continue

                chunks = chunk_text(extracted_text)

                if not chunks:

                    self.stdout.write(
                        self.style.WARNING(
                            " -> Skipped: no chunks created"
                        )
                    )

                    skipped_count += 1
                    continue

                self.stdout.write(
                    f" -> Creating {len(chunks)} chunks"
                )

                embeddings = generate_embeddings(chunks)

                if len(embeddings) != len(chunks):

                    raise ValueError(
                        "Number of embeddings does not match "
                        "number of chunks."
                    )

                add_chunks_to_store(
                    document.id,
                    chunks,
                    embeddings
                )

                indexed_count += 1

                self.stdout.write(
                    self.style.SUCCESS(
                        f" -> Successfully indexed "
                        f"{len(chunks)} chunks"
                    )
                )

            except Exception as e:

                failed_count += 1

                self.stdout.write(
                    self.style.ERROR(
                        f" -> Failed: {str(e)}"
                    )
                )

        self.stdout.write("\n" + "=" * 50)

        self.stdout.write(
            self.style.SUCCESS(
                f"Documents newly indexed: {indexed_count}"
            )
        )

        self.stdout.write(
            self.style.WARNING(
                f"Documents skipped: {skipped_count}"
            )
        )

        self.stdout.write(
            self.style.ERROR(
                f"Documents failed: {failed_count}"
            )
        )

        self.stdout.write(
            f"Total documents checked: {total_documents}"
        )

        self.stdout.write("=" * 50 + "\n")