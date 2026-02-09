import { ExceptionFilter, Catch, ArgumentsHost, HttpException } from '@nestjs/common';
import { Request, Response } from 'express';

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: HttpException, host: ArgumentsHost) { // 1. O tipo do erro é HttpException, que é a base para erros HTTP no NestJS
    const ctx = host.switchToHttp(); // 2. Pega o contexto HTTP para acessar request e response
    const response = ctx.getResponse<Response>(); // 3. Pega o objeto de resposta para enviar a resposta personalizada
    const request = ctx.getRequest<Request>(); // 4. Pega o objeto de requisição para incluir detalhes na resposta
    const status = exception.getStatus(); // 5. Pega o status code do erro (ex: 400, 404, 500)
    const exceptionResponse = exception.getResponse(); // 6. Pega o corpo da resposta do erro, que pode ser uma string ou um objeto (ex: { message: 'Erro de validação', errors: [...] })

    // 🧠 A Mágica: Verifica se é um erro de validação (array) ou erro simples (string)
    const errorBody =
      typeof exceptionResponse === 'object' && 'message' in exceptionResponse
        ? (exceptionResponse as any).message // Pega a lista de erros do class-validator
        : exception.message;

    response.status(status).json({
      statusCode: status,
      timestamp: new Date().toISOString(),
      path: request.url, // 📍 Útil para saber onde o erro aconteceu
      method: request.method,
      message: errorBody,
    });
  }
}