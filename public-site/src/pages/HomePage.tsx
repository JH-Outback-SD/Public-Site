import { useState } from 'react'
import { Link } from 'react-router-dom'

export default function HomePage() {
  const [videoPlaying, setVideoPlaying] = useState(false)

  return (
    <div className="bg-white">
      {/* Hero + Video wrapper for mobile reordering */}
      <div className="flex flex-col">
        {/* Video Section - shows first on mobile */}
        <section className="relative z-10 order-1 bg-[#213a86] pb-8 pt-8 md:order-2 md:-mt-16 md:bg-transparent md:pb-16 md:pt-0">
          <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
            <div className="overflow-hidden rounded-lg border-2 border-white bg-black shadow-[0_10px_40px_-5px_rgba(0,0,0,0.85)]">
              <div className="relative aspect-video">
                {!videoPlaying ? (
                  <>
                    {/* Video Thumbnail */}
                    <img
                      src="https://vumbnail.com/847077331.jpg"
                      alt="Video thumbnail"
                      className="size-full object-cover"
                    />
                    {/* Play Button Overlay */}
                    <button
                      onClick={() => setVideoPlaying(true)}
                      className="absolute inset-0 flex items-center justify-center bg-black/30 transition-colors hover:bg-black/40"
                      aria-label="Play video"
                    >
                      <div className="flex size-20 items-center justify-center rounded-full bg-white/90 shadow-lg transition-transform hover:scale-110">
                        <svg
                          className="ml-1 size-8 text-primary"
                          fill="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path d="M8 5v14l11-7z" />
                        </svg>
                      </div>
                    </button>
                  </>
                ) : (
                  <iframe
                    src="https://player.vimeo.com/video/847077331?autoplay=1"
                    className="size-full"
                    allow="autoplay; fullscreen; picture-in-picture"
                    allowFullScreen
                    title="JH Outback Video"
                  />
                )}
              </div>
            </div>
          </div>
        </section>

        {/* Hero Section - shows second on mobile */}
        <section className="relative order-2 pb-8 pt-8 md:order-1 md:pb-32 md:pt-16">
          {/* Background Image */}
          <div className="absolute inset-0">
            <img
              src="https://jhoutback.com/wp-content/uploads/2022/08/home-linkbg-outback.jpg"
              alt=""
              className="size-full object-fill"
            />
            <div className="absolute inset-0 bg-[#213a86]/85" />
          </div>
          {/* Top fade gradient for mobile - creates smooth transition from video section */}
          <div className="absolute inset-x-0 top-0 h-16 bg-gradient-to-b from-[#213a86] to-transparent md:hidden" />

          {/* Content */}
          <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <h1 className="font-sans text-4xl font-bold text-gray-50 sm:text-5xl lg:text-6xl">
                // WELCOME
              </h1>
              <div className="mx-auto mt-8 max-w-3xl space-y-4 text-gray-100">
                <p>
                  We are a 501(c)(3) nonprofit organization and proud to be a part of the
                  JH Outback (JHO) family. Our mission is to transform lives, communities, and
                  families by fostering stronger connections and deeper relationships with God
                  alongside the wonderful San Diego community.
                </p>
                <p>
                  At JH Outback San Diego County, we believe change begins with choice. In your
                  local community, and collective connect to change the world. Through our
                  Huddle Groups, Events, and Volunteer opportunities, we want to help you
                  elevate what matters most - those you love and cherish in faith, and spiritually.
                </p>
                <p>
                  Join us on a journey to change San Diego, transform communities one
                  connection, one relationship at a time. Together we can create a ripple
                  effect of hope, love, and transformation.
                </p>
              </div>
            </div>
          </div>
        </section>
      </div>

      {/* Stay Connected Section */}
      <section className="bg-gray-50 py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="mb-4 flex justify-center">
              <svg className="size-8 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13.19 8.688a4.5 4.5 0 011.242 7.244l-4.5 4.5a4.5 4.5 0 01-6.364-6.364l1.757-1.757m13.35-.622l1.757-1.757a4.5 4.5 0 00-6.364-6.364l-4.5 4.5a4.5 4.5 0 001.242 7.244" />
              </svg>
            </div>
            <h2 className="font-heading text-3xl font-bold text-accent sm:text-4xl">
              Stay Connected!
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-gray-600">
              Stay connected with JH Outback San Diego County by following us on social media and
              subscribing to our newsletter for updates, inspiring stories, and event announcements. Don't
              miss the chance to explore all we have to offer and be part of a growing community
              dedicated to faith, family, and serving relationships.
            </p>
          </div>

          {/* Events and Groups Cards */}
          <div className="mt-12 grid gap-8 md:grid-cols-2">
            <Link
              to="/events"
              className="group relative overflow-hidden rounded-lg shadow-lg transition-transform hover:scale-[1.02]"
            >
              <img
                src="https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=600&h=400&fit=crop"
                alt="Events"
                className="h-64 w-full object-cover"
              />
              <div className="absolute inset-0 bg-[#182B65]/70" />
              <div className="absolute bottom-0 left-0 p-6">
                <h3 className="font-heading text-2xl font-bold text-white">Events</h3>
                <p className="mt-1 text-sm text-white/80">
                  Join us for life-changing retreats, conferences
                </p>
              </div>
            </Link>

            <Link
              to="/groups"
              className="group relative overflow-hidden rounded-lg shadow-lg transition-transform hover:scale-[1.02]"
            >
              <img
                src="https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=600&h=400&fit=crop"
                alt="Groups"
                className="h-64 w-full object-cover"
              />
              <div className="absolute inset-0 bg-[#4A8A9B]/80" />
              <div className="absolute bottom-0 left-0 p-6">
                <h3 className="font-heading text-2xl font-bold text-white">Groups</h3>
                <p className="mt-1 text-sm text-white/80">
                  Join one of our Huddle groups in San Diego
                </p>
              </div>
            </Link>
          </div>
        </div>
      </section>

      {/* Volunteer Section */}
      <section className="py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="font-heading text-3xl font-bold text-primary sm:text-4xl">
              Volunteer
            </h2>
          </div>

          <div className="mt-12 grid gap-8 md:grid-cols-2">
            <img
              src="https://images.unsplash.com/photo-1559027615-cd4628902d4a?w=600&h=400&fit=crop"
              alt="Volunteer helping"
              className="h-64 w-full rounded-lg object-cover shadow-lg"
            />
            <img
              src="https://images.unsplash.com/photo-1491438590914-bc09fcaaf77a?w=600&h=400&fit=crop"
              alt="Group of volunteers"
              className="h-64 w-full rounded-lg object-cover shadow-lg"
            />
          </div>

          <div className="mt-8 text-center">
            <p className="mx-auto max-w-2xl text-gray-600">
              Join our mission to strengthen families and communities by getting involved with JH Outback San Diego County.
              Whether you want to volunteer at our events or join a committee to help plan and run them, your time and
              talents make a real difference. Build lasting friendships, develop leadership skills, and be part of a team
              dedicated to inspiring positive change. Together, we can transform lives and impact our community!
            </p>
            <div className="mt-6 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Link
                to="/volunteer"
                className="inline-block rounded-md bg-[#182B65] px-8 py-3 text-sm font-medium text-white transition-colors hover:bg-[#182B65]/90"
              >
                Get Involved
              </Link>
              <Link
                to="/events"
                className="inline-block rounded-md bg-[#BC2931] px-8 py-3 text-sm font-medium text-white transition-colors hover:bg-[#BC2931]/90"
              >
                View Upcoming Events
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
