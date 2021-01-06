import { EntityRepository, Repository } from 'typeorm';
import { Category } from '../entities/category.entity';

@EntityRepository(Category)
export class CategoryRepository extends Repository<Category> {
  async getOrCreateCategory(name: string): Promise<Category> {
    const slug = name.toLowerCase().trim().replace(/ /g, '-');
    let category = await this.findOne({ slug });
    if (category) {
      return category;
    }
    category = await this.save(this.create({ name, slug }));
    return category;
  }
}
