import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { PrismaService } from 'src/prisma.service';
import { PaginationDto } from 'src/common';

@Injectable()
export class ProductsService {
  
  // Inyectamos dependencias
  constructor(private prisma: PrismaService) {}

  async create(createProductDto: CreateProductDto) {
    // Grabamos en la base de datos
    const product = await this.prisma.product.create({
      data: createProductDto,
    });

    return product;
  }

  async findAll(paginationDto: PaginationDto) {

    const {page = 1, limit = 10} = paginationDto;

    // Total de paginas
    const totalPages = await this.prisma.product.count({ where:{available:true}})
    const lastPage = Math.ceil(totalPages / limit);

    return {
    data: await this.prisma.product.findMany({
      skip: (page - 1) * limit,
      take: limit, 
      where:{
        available:true
      }
      }),
      meta: {
        total: totalPages,
        page: page,
        lastPage: lastPage,
      }
    }
  }

  // Buscamos un producto por su ID
  async findOne(id: number) {
    const product = await this.prisma.product.findFirst({
      where:{id:id, available: true}
    });

    if (!product){
      throw new NotFoundException(`Product with id # ${id} not found`);
    }

    return product;
  }

  // Actualizar un producto
  async update(id: number, updateProductDto: UpdateProductDto) {

    const {id: __, ...data} = updateProductDto;

    // verificamos que el producto exista en la DB para evitar errores en la base de datos
    await this.findOne(id);

    return this.prisma.product.update({
      where: {id},
      data: data,
    });
  }

  // Eliminamos un producto
  async remove(id: number) {

    await this.findOne(id)

    // return this.prisma.product.delete({
    //   where:{id}
    // }); 

    const product = await this.prisma.product.update({
      where: {id},
      data: {
        available: false
      }
    });
    
    return product;
  }
}
