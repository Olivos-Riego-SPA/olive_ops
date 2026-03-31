'use client';

import { useEffect, useTransition } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import * as z from 'zod';
import { loginAction } from '@/actions/auth/login';

const ALLOWED_DOMAINS = ['@olivos.cl', '@olivosirrigation.com'];

const formSchema = z.object({
  email: z.string()
    .email({ message: 'Ingrese una dirección de correo válida' })
    .refine(
      email => ALLOWED_DOMAINS.some(d => email.toLowerCase().endsWith(d)),
      { message: 'Solo usuarios @olivos.cl o @olivosirrigation.com pueden ingresar' },
    ),
  password: z.string().min(8, { message: 'La contraseña debe tener al menos 8 caracteres' }),
  rememberMe: z.boolean().optional(),
});

type FormValues = z.infer<typeof formSchema>;

export default function LoginForm() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: { email: '', password: '', rememberMe: false },
  });

  useEffect(() => {
    const savedEmail = localStorage.getItem('email');
    const savedPassword = localStorage.getItem('password');
    const savedRememberMe = localStorage.getItem('rememberMe') === 'true';

    if (savedEmail) {
      setValue('email', savedEmail);
      setValue('password', savedPassword || '');
      setValue('rememberMe', savedRememberMe);
    }
  }, [setValue]);

  const onSubmit = (data: FormValues) => {
    startTransition(async () => {
      try {
        toast.info('Iniciando sesión...', { duration: 2000 });

        const result = await loginAction(data.email, data.password, 'es');

        if (result) {
          if (data.rememberMe) {
            localStorage.setItem('email', data.email);
            localStorage.setItem('password', data.password);
            localStorage.setItem('rememberMe', 'true');
          } else {
            localStorage.removeItem('email');
            localStorage.removeItem('password');
            localStorage.removeItem('rememberMe');
          }

          toast.success('Inicio de sesión exitoso');
          router.push('/dashboard');
          router.refresh();
        }
      } catch {
        toast.error('Correo o contraseña incorrectos');
      }
    });
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Email */}
      <div className="space-y-1">
        <label
          htmlFor="email"
          className="block uppercase tracking-label text-label-md font-display text-on-surface-variant"
        >
          Correo Electrónico
        </label>
        <input
          id="email"
          type="email"
          autoComplete="email"
          disabled={isPending}
          placeholder="usuario@olivos.cl"
          className="input-technical w-full py-2 text-body-md text-on-surface placeholder:text-outline disabled:opacity-50"
          {...register('email')}
        />
        {errors.email && (
          <p className="text-label-sm text-tertiary">{errors.email.message}</p>
        )}
      </div>

      {/* Password */}
      <div className="space-y-1">
        <label
          htmlFor="password"
          className="block uppercase tracking-label text-label-md font-display text-on-surface-variant"
        >
          Contraseña
        </label>
        <input
          id="password"
          type="password"
          autoComplete="current-password"
          disabled={isPending}
          placeholder="••••••••"
          className="input-technical w-full py-2 text-body-md text-on-surface placeholder:text-outline disabled:opacity-50"
          {...register('password')}
        />
        {errors.password && (
          <p className="text-label-sm text-tertiary">{errors.password.message}</p>
        )}
      </div>

      {/* Remember me */}
      <div className="flex items-center gap-2">
        <input
          id="rememberMe"
          type="checkbox"
          disabled={isPending}
          className="w-3.5 h-3.5 rounded-none border border-outline-variant bg-transparent accent-secondary cursor-pointer"
          {...register('rememberMe')}
        />
        <label
          htmlFor="rememberMe"
          className="text-label-md text-on-surface-variant cursor-pointer select-none"
        >
          Recordar contraseña
        </label>
      </div>

      {/* Submit */}
      <button
        type="submit"
        disabled={isPending}
        className="w-full py-2.5 rounded-sm bg-secondary-container text-on-secondary-container font-display font-semibold text-label-lg uppercase tracking-label transition-opacity duration-(--duration-fast) hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isPending ? 'Ingresando...' : 'Ingresar'}
      </button>
    </form>
  );
}
