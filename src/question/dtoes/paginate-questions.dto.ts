export class PaginateQuestionsDto {
  page: string | number;
  sortBy?: 'created_at';
  sortOrder?: 'ASC' | 'DESC';
}
