import { EntityRepository, Repository } from 'typeorm';
import { Category } from './category.entity';

@EntityRepository(Category)
export class CategoryRepository extends Repository<Category> {
  async getOrCreateCategory(name: string): Promise<Category> {
    const slug = name.trim().replace(' ', '-');
    let category = await this.findOne({ name, slug });
    if (category) {
      return category;
    }
    category = await this.save(this.create({ name, slug }));
    return category;
  }
}
