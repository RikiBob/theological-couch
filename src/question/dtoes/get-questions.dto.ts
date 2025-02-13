export class GetQuestionsDto {
  page: string | number;
  sortBy?: 'created_at';
  sortOrder?: 'ASC' | 'DESC';
}
