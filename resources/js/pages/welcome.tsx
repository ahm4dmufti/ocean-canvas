import { Form, Head, Link, usePage } from '@inertiajs/react';
import {
    motion,
    useMotionTemplate,
    useMotionValue,
    useSpring,
} from 'motion/react';
import type { MouseEvent } from 'react';
import { useMemo, useRef } from 'react';
import { Waves } from 'lucide-react';
import InputError from '@/components/input-error';
import PasswordInput from '@/components/password-input';
import TextLink from '@/components/text-link';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Spinner } from '@/components/ui/spinner';
import { dashboard, register } from '@/routes';
import { store } from '@/routes/login';

export default function Welcome() {
    const { auth } = usePage().props;
    const cardRef = useRef<HTMLDivElement>(null);

    const rotateX = useMotionValue(0);
    const rotateY = useMotionValue(0);
    const springRotateX = useSpring(rotateX, { stiffness: 150, damping: 20 });
    const springRotateY = useSpring(rotateY, { stiffness: 150, damping: 20 });
    const glowX = useSpring(50, { stiffness: 150, damping: 20 });
    const glowY = useSpring(50, { stiffness: 150, damping: 20 });
    const glowBackground = useMotionTemplate`radial-gradient(circle at ${glowX}% ${glowY}%, rgba(255,255,255,0.4), transparent 60%)`;

    function handleCardMouseMove(event: MouseEvent<HTMLDivElement>) {
        const rect = cardRef.current?.getBoundingClientRect();
        if (!rect) {
            return;
        }

        const px = (event.clientX - rect.left) / rect.width;
        const py = (event.clientY - rect.top) / rect.height;

        rotateY.set((px - 0.5) * 12);
        rotateX.set((0.5 - py) * 12);
        glowX.set(px * 100);
        glowY.set(py * 100);
    }

    function handleCardMouseLeave() {
        rotateX.set(0);
        rotateY.set(0);
        glowX.set(50);
        glowY.set(50);
    }

    return (
        <>
            <Head title="Welcome" />

            <div className="relative flex min-h-screen items-center justify-center overflow-hidden p-6">
                <SummerBackdrop />

                <div className="relative z-10 grid w-full max-w-4xl gap-12 lg:grid-cols-2 lg:items-center lg:gap-16">
                    <motion.div
                        initial={{ opacity: 0, y: -16 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, ease: 'easeOut' }}
                        className="space-y-4 text-center lg:text-left"
                    >
                        <div className="text-muted-foreground flex items-center justify-center gap-2 text-sm font-medium lg:justify-start">
                            <Waves className="size-4 text-amber-500 dark:text-amber-300" />
                            Benghazi, Libya
                        </div>
                        <h1 className="bg-gradient-to-r from-amber-500 via-orange-500 to-rose-500 bg-clip-text text-4xl font-bold tracking-tight text-transparent sm:text-5xl dark:from-amber-300 dark:via-orange-400 dark:to-rose-400">
                            The ocean that paints itself
                        </h1>
                        <p className="text-muted-foreground mx-auto max-w-md text-base lg:mx-0">
                            A new piece of generative art every day, painted
                            from that day's real wave, wind, and temperature
                            data — with a surf call, a daily quote, and a place
                            to keep your own beach photos.
                        </p>
                    </motion.div>

                    <motion.div
                        ref={cardRef}
                        onMouseMove={handleCardMouseMove}
                        onMouseLeave={handleCardMouseLeave}
                        style={{
                            rotateX: springRotateX,
                            rotateY: springRotateY,
                            transformPerspective: 1000,
                        }}
                        initial={{ opacity: 0, scale: 0.94 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.7, ease: 'easeOut' }}
                        className="border-border bg-card/70 relative isolate overflow-hidden rounded-2xl border p-8 shadow-2xl shadow-orange-900/10 backdrop-blur-sm dark:shadow-black/40"
                    >
                        <motion.div
                            style={{ background: glowBackground }}
                            className="pointer-events-none absolute inset-0 z-10"
                        />

                        <div className="relative z-20">
                            {auth.user ? (
                                <div className="space-y-4 text-center">
                                    <p className="text-lg font-semibold">
                                        Welcome back, {auth.user.name}.
                                    </p>
                                    <Button
                                        asChild
                                        size="lg"
                                        className="w-full bg-gradient-to-r from-amber-500 to-rose-500 text-white hover:from-amber-500/90 hover:to-rose-500/90"
                                    >
                                        <Link href={dashboard()}>
                                            Go to dashboard
                                        </Link>
                                    </Button>
                                </div>
                            ) : (
                                <Form
                                    {...store.form()}
                                    resetOnSuccess={['password']}
                                    className="flex flex-col gap-5"
                                >
                                    {({ processing, errors }) => (
                                        <>
                                            <div className="grid gap-2">
                                                <Label htmlFor="email">
                                                    Email address
                                                </Label>
                                                <Input
                                                    id="email"
                                                    type="email"
                                                    name="email"
                                                    required
                                                    autoFocus
                                                    tabIndex={1}
                                                    autoComplete="email"
                                                    placeholder="email@example.com"
                                                />
                                                <InputError
                                                    message={errors.email}
                                                />
                                            </div>

                                            <div className="grid gap-2">
                                                <Label htmlFor="password">
                                                    Password
                                                </Label>
                                                <PasswordInput
                                                    id="password"
                                                    name="password"
                                                    required
                                                    tabIndex={2}
                                                    autoComplete="current-password"
                                                    placeholder="Password"
                                                />
                                                <InputError
                                                    message={errors.password}
                                                />
                                            </div>

                                            <div className="flex items-center space-x-3">
                                                <Checkbox
                                                    id="remember"
                                                    name="remember"
                                                    tabIndex={3}
                                                />
                                                <Label htmlFor="remember">
                                                    Remember me
                                                </Label>
                                            </div>

                                            <Button
                                                type="submit"
                                                size="lg"
                                                tabIndex={4}
                                                disabled={processing}
                                                data-test="login-button"
                                                className="w-full bg-gradient-to-r from-amber-500 to-rose-500 text-white hover:from-amber-500/90 hover:to-rose-500/90"
                                            >
                                                {processing && <Spinner />}
                                                Log in
                                            </Button>

                                            <div className="text-muted-foreground text-center text-sm">
                                                Don't have an account?{' '}
                                                <TextLink
                                                    href={register()}
                                                    tabIndex={5}
                                                >
                                                    Sign up
                                                </TextLink>
                                            </div>
                                        </>
                                    )}
                                </Form>
                            )}
                        </div>
                    </motion.div>
                </div>
            </div>
        </>
    );
}

function SummerBackdrop() {
    const particles = useMemo(
        () =>
            Array.from({ length: 18 }, (_, i) => ({
                id: i,
                left: (i * 41) % 100,
                delay: (i % 8) * 0.6,
                duration: 6 + (i % 5),
                size: 2 + (i % 3),
            })),
        [],
    );

    return (
        <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
            <div
                className="absolute -top-1/3 -right-1/4 h-[70%] w-[70%] rounded-full opacity-30 blur-3xl dark:opacity-20"
                style={{
                    background:
                        'radial-gradient(circle, hsl(28 90% 65%), transparent 70%)',
                }}
            />
            <div
                className="absolute -bottom-1/3 -left-1/4 h-[60%] w-[60%] rounded-full opacity-20 blur-3xl dark:opacity-10"
                style={{
                    background:
                        'radial-gradient(circle, hsl(200 80% 60%), transparent 70%)',
                }}
            />
            <motion.div
                animate={{ scale: [1, 1.08, 1], opacity: [0.25, 0.4, 0.25] }}
                transition={{
                    duration: 8,
                    repeat: Infinity,
                    ease: 'easeInOut',
                }}
                className="absolute top-10 right-10 h-40 w-40 rounded-full bg-amber-300/40 blur-2xl dark:bg-amber-400/20"
            />
            {particles.map((particle) => (
                <motion.span
                    key={particle.id}
                    className="absolute bottom-0 rounded-full bg-white/70 dark:bg-white/30"
                    style={{
                        left: `${particle.left}%`,
                        width: particle.size,
                        height: particle.size,
                    }}
                    animate={{ y: ['0%', '-120%'], opacity: [0, 0.8, 0] }}
                    transition={{
                        duration: particle.duration,
                        delay: particle.delay,
                        repeat: Infinity,
                        ease: 'easeInOut',
                    }}
                />
            ))}
        </div>
    );
}
