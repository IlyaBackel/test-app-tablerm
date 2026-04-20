'use client';

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

const tokenSchema = z.object({
  token: z.string()
    .min(1, 'Обязательное поле')
    .regex(/^[a-fA-F0-9]{64}$/, 'Неверный формат токена (должно быть 64 hex символа)'),
});

type FormValues = z.infer<typeof tokenSchema>;

interface TokenAuthProps {
  onAuthorize: (token: string) => void;
}

export function TokenAuth({ onAuthorize }: TokenAuthProps) {
  const form = useForm<FormValues>({
    resolver: zodResolver(tokenSchema),
    defaultValues: {
      token: "",
    },
  });

  function onSubmit( data: FormValues) {
    onAuthorize(data.token);
  }

  return (
    <Card className="w-full max-w-md mx-auto mt-10 shadow-lg p-4">
      <CardHeader>
        <CardTitle className="text-2xl">Авторизация в кассе</CardTitle>
        <CardDescription>Введите токен вашей кассы для начала работы</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="token"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Токен кассы</FormLabel>
                  <FormControl>
                    <Input placeholder="af187461..." {...field} autoComplete="off" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" className="w-full bg-blue-500">Войти в систему</Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}