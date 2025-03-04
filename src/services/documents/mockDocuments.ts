
import { Document } from "@/lib/types";

/**
 * Returns mock documents for a given project
 */
export const getMockDocuments = (projectId: string): Document[] => {
  return [
    {
      id: 'doc_1',
      name: 'Brand Strategy.pdf',
      size: 1024 * 1024 * 2.3, // 2.3 MB
      type: 'application/pdf',
      url: 'https://example.com/docs/brand-strategy.pdf',
      projectId: projectId,
      createdAt: new Date('2023-01-15'),
      uploadedAt: '2023-01-15T09:30:00Z',
      uploadedBy: 'user_789',
      priority: 3
    },
    {
      id: 'doc_2',
      name: 'Market Research.xlsx',
      size: 1024 * 1024 * 4.1, // 4.1 MB
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      url: 'https://example.com/docs/market-research.xlsx',
      projectId: projectId,
      createdAt: new Date('2023-01-12'),
      uploadedAt: '2023-01-12T11:45:00Z',
      uploadedBy: 'user_456',
      priority: 2
    },
    {
      id: 'doc_3',
      name: 'Competitor Analysis.docx',
      size: 1024 * 1024 * 1.7, // 1.7 MB
      type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      url: 'https://example.com/docs/competitor-analysis.docx',
      projectId: projectId,
      createdAt: new Date('2023-01-10'),
      uploadedAt: '2023-01-10T15:20:00Z',
      uploadedBy: 'user_123',
      priority: 1
    }
  ];
};
