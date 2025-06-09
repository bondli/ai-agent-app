import { BaseRetriever, type BaseMessage } from '@voltagent/core';
import logger from 'electron-log';

// --- Simple Knowledge Base Retriever ---
class KnowledgeBaseRetriever extends BaseRetriever {

  // Our tiny "knowledge base"
  private documents = [
    {
      id: "doc1",
      content: "What is VoltAgent? VoltAgent is a TypeScript framework for building AI agents.",
    },
    {
      id: "doc2",
      content:
        "What features does VoltAgent support? VoltAgent supports tools, memory, sub-agents, and retrievers for RAG.",
    },
    { id: "doc3", content: "What is RAG? RAG stands for Retrieval-Augmented Generation." },
    {
      id: "doc4",
      content:
        "How can I test my agent? You can test VoltAgent agents using the VoltAgent Console.",
    },
  ];

  // Reverting to simple retrieve logic
  async retrieve(input: string | BaseMessage[]): Promise<string> {
    const query = typeof input === "string" ? input : (input[input.length - 1].content as string);
    const queryLower = query.toLowerCase();
    logger.info(`[KnowledgeBaseRetriever] Searching for context related to: "${query}"`);

    // Simple includes check
    const relevantDocs = this.documents.filter((doc) =>
      doc.content.toLowerCase().includes(queryLower)
    );

    if (relevantDocs.length > 0) {
      const contextString = relevantDocs.map((doc) => `- ${doc.content}`).join("\n");
      logger.info(`[KnowledgeBaseRetriever] Found context:\n${contextString}`);
      return `Relevant Information Found:\n${contextString}`;
    }

    logger.info("[KnowledgeBaseRetriever] No relevant context found.");
    return "No relevant information found in the knowledge base.";
  }
}

export default KnowledgeBaseRetriever;