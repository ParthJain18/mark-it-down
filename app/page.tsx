'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';

export default function Home() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [feedback, setFeedback] = useState('');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');

  const handleFeedbackChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    setFeedback(value);

    // Check for secret phrase
    if (value.toLowerCase().includes('hakunamatata')) {
      // Redirect based on auth state
      if (status === 'authenticated') {
        router.push('/dashboard');
      } else {
        router.push('/login');
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Hero Section */}
      <header className="container mx-auto px-4 py-16">
        <div className="text-center">
          <h1 className="text-5xl font-bold text-gray-900 mb-4">
            My React Playground (WIP)
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            just some random tests and things i'm trying out with react and nextjs
          </p>
        </div>
      </header>

      {/* About Section */}
      <section className="container mx-auto px-4 py-12">
        <Card className="p-8 mb-8">
          <h2 className="text-3xl font-semibold mb-4 text-gray-800">Random Notes</h2>
          <p className="text-gray-600 mb-4">
            trying to figure out how to build stuff. this is basically a sandbox where i can break things and see how they work.
            it's a bit messy but that's how you learn i guess. might add some api stuff later if i can get it to work.
          </p>
        </Card>
      </section>

      {/* Skills Section */}
      <section className="container mx-auto px-4 py-12">
        <h2 className="text-3xl font-semibold mb-8 text-center text-gray-800">Stuff I'm messing with</h2>
        <div className="grid md:grid-cols-3 gap-6">
          <Card className="p-6 hover:shadow-lg transition-shadow">
            <h3 className="text-xl font-semibold mb-2 text-gray-800">State Management</h3>
            <p className="text-gray-600">
              useState is fine but need to look at more complex stuff eventually.
            </p>
          </Card>
          <Card className="p-6 hover:shadow-lg transition-shadow">
            <h3 className="text-xl font-semibold mb-2 text-gray-800">Styling</h3>
            <p className="text-gray-600">
              using tailwind for everything now, it's actually way faster than css.
            </p>
          </Card>
          <Card className="p-6 hover:shadow-lg transition-shadow">
            <h3 className="text-xl font-semibold mb-2 text-gray-800">Components</h3>
            <p className="text-gray-600">
              trying to keep things small and reusable. mostly.
            </p>
          </Card>
        </div>
      </section>

      {/* Sample Features */}
      <section className="container mx-auto px-4 py-12">
        <h2 className="text-3xl font-semibold mb-8 text-center text-gray-800">Test Area</h2>
        <div className="grid md:grid-cols-2 gap-6 mb-12">
          <Card className="p-6">
            <h3 className="text-xl font-semibold mb-4 text-gray-800">Test 1: Counter stuff</h3>
            <CounterComponent />
          </Card>
          <Card className="p-6">
            <h3 className="text-xl font-semibold mb-4 text-gray-800">Test 2: Lists n things</h3>
            <ListComponent />
          </Card>
        </div>
      </section>

      {/* Feedback Form - Secret Entry */}
      <section className="container mx-auto px-4 py-12 mb-16">
        <Card className="p-8 max-w-2xl mx-auto">
          <h2 className="text-3xl font-semibold mb-6 text-gray-800">Drop a comment</h2>
          <p className="text-gray-600 mb-6">
            Testing out how forms work in React. Leave a comment if you want, it probably doesn't go anywhere yet lol.
          </p>
          <div className="space-y-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                Name
              </label>
              <Input
                id="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="your name or whatever"
                className="w-full"
              />
            </div>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                Email
              </label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="email address"
                className="w-full"
              />
            </div>
            <div>
              <label htmlFor="feedback" className="block text-sm font-medium text-gray-700 mb-2">
                Your thoughts
              </label>
              <Textarea
                id="feedback"
                value={feedback}
                onChange={handleFeedbackChange}
                placeholder="write something here..."
                className="w-full min-h-[120px]"
              />
            </div>
            <Button className="w-full">
              Send it
            </Button>
          </div>
        </Card>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-8">
        <div className="container mx-auto px-4 text-center">
          <p>&copy; 2026 My React Playground - Learning Stuff</p>
        </div>
      </footer>
    </div>
  );
}

// Counter Component
function CounterComponent() {
  const [count, setCount] = useState(0);

  return (
    <div className="space-y-4">
      <p className="text-2xl font-bold text-center text-gray-800">{count}</p>
      <div className="flex gap-2">
        <Button onClick={() => setCount(count - 1)} variant="outline" className="flex-1">
          Decrease
        </Button>
        <Button onClick={() => setCount(0)} variant="outline" className="flex-1">
          Reset
        </Button>
        <Button onClick={() => setCount(count + 1)} className="flex-1">
          Increase
        </Button>
      </div>
    </div>
  );
}

// List Component
function ListComponent() {
  const items = ['React Hooks', 'Component Props', 'State Management', 'Event Handling', 'Conditional Rendering'];

  return (
    <ul className="space-y-2">
      {items.map((item, index) => (
        <li key={index} className="flex items-center text-gray-700">
          <span className="mr-2 text-indigo-600">✓</span>
          {item}
        </li>
      ))}
    </ul>
  );
}
