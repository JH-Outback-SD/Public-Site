const huddleGroups = [
  {
    id: 1,
    name: 'East County Huddle',
    description:
      "This is a Men's Huddle group based in Spring Valley. The group meets once a week on Wednesdays at 6:30 PM for 1.5 hrs.",
    location: 'Faith Chapel Campus',
    address: '9400 Campo Rd, Spring Valley, CA 91977',
    meetingTime: 'Wednesday at 6:30 PM',
    contact: 'jhoutbacksd@gmail.com',
    contactImage: '/images/email-jhoutbacksd-gmail-300x48.png',
    signupUrl: 'https://mailchi.mp/d271485b29da/2ilmqw4gkx',
    image: '/images/huddle-east-county.png',
    mapUrl: 'https://maps.app.goo.gl/B2VrL5PaLRJ48RGF6',
    active: true,
  },
  {
    id: 2,
    name: 'Poway',
    description: "This is a Men's Huddle group based in Poway. The group meets once a week on Tuesdays at 6:30 AM for 1.5 hrs.",
    location: 'Panera Bread',
    address: '12156 Carmel Mountain Rd. San Diego, CA 92128',
    meetingTime: 'Thursday Monday at 6:30 PM',
    contact: 'joehaeussler@yahoo.com',
    contactImage: '/images/email-joe-h-yahoo-300x45.png',
    image: '/images/huddle-panera-bread.png',
    mapUrl: 'https://maps.app.goo.gl/qi3MxstAkePNhtzHA',
    active: true,
  },
  {
    id: 3,
    name: 'Carlsbad',
    description: "This is a Men's Huddle group based in Carlsbad. The group meets once a week on Tuesdays at 6:30 AM for 1.5 hrs.",
    location: 'Coastline Church',
    address: '2215 Calle Barcelona, Carlsbad, CA 92009',
    meetingTime: 'Wednesday at 6:30 PM',
    contact: 'isaac.pollock@gmail.com',
    contactImage: '/images/email-isaac-gmail-300x45.png',
    image: '/images/huddle-coastline-carlsbad.png',
    mapUrl: 'https://maps.app.goo.gl/bXkE7X2NzsBAcPSGA',
    active: true,
  },
  {
    id: 4,
    name: 'Encinitas Women',
    description: "This is a Women's Huddle group based in Encinitas. The group meets once a week on Wednesdays at 9:15 AM for 1.5 hrs.",
    location: 'Venture Church',
    address: '777 Santa Fe Dr, Encinitas, CA 92024',
    meetingTime: 'Wednesday Mornings at 9:15 AM',
    contact: 'aurora@robertcolello.com',
    contactImage: '/images/email-aurora-robertcollelo-300x45.png',
    image: '/images/huddle-venture-church.png',
    mapUrl: 'https://maps.app.goo.gl/jSWoB2p1DLc9wxB68',
    active: true,
  },
]

export default function GroupsPage() {
  const activeGroups = huddleGroups.filter((g) => g.active)
  const inactiveGroups = huddleGroups.filter((g) => !g.active)

  return (
    <div className="bg-white">
      {/* Hero Section */}
      <section className="relative py-16">
        {/* Background Image */}
        <div className="absolute inset-0">
          <img
            src="https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=1200&h=600&fit=crop"
            alt=""
            className="size-full object-cover"
          />
          {/* Blue overlay */}
          <div className="absolute inset-0 bg-[#213a86]/85" />
        </div>

        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="font-sans text-4xl font-bold text-gray-50 sm:text-5xl">
              // HUDDLE GROUPS
            </h1>
            <p className="mx-auto mt-6 max-w-3xl text-gray-100">
              Find and find your group near. It can be hard to find{' '}
              <span className="font-semibold text-teal-light">go together</span>. We know that
              without community it gets hard. By being found it belongs on all life. Take up the
              chance to be a JH Outback Huddle group!
            </p>
          </div>

          <div className="mt-8 text-center">
            <h2 className="text-xl font-medium text-gray-200">
              Find a local huddle group in your area
            </h2>
          </div>
        </div>
      </section>

      {/* Active Groups */}
      <section className="bg-gray-50 py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h3 className="mb-8 text-sm font-semibold uppercase tracking-wider text-primary">
            Active Groups
          </h3>

          <div className="space-y-12">
            {activeGroups.map((group) => (
              <div
                key={group.id}
                className="overflow-hidden rounded-lg bg-white shadow-md"
              >
                <div className="grid md:grid-cols-3">
                  <div className="md:col-span-1">
                    <img
                      src={group.image}
                      alt={group.name}
                      className="h-48 w-full object-cover md:h-full"
                    />
                  </div>
                  <div className="p-6 md:col-span-2">
                    <h4 className="text-2xl font-bold text-primary">{group.name}</h4>
                    <p className="mt-1 text-sm text-gray-500">{group.meetingTime}</p>
                    <p className="mt-4 text-gray-600">{group.description}</p>

                    <div className="mt-4 space-y-2 text-sm text-gray-600">
                      <p>
                        <span className="font-medium">Location:</span> {group.location}
                      </p>
                      <p>{group.address}</p>
                    </div>

                    <div className="mt-4">
                      <p className="text-sm text-gray-500">For more information:</p>
                      <img
                        src={group.contactImage}
                        alt="Contact email"
                        className="mt-1 h-[45px] w-auto"
                      />
                      {'signupUrl' in group && group.signupUrl && (
                        <a
                          href={group.signupUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="mt-3 inline-block rounded-md bg-[#182B65] px-6 py-2 text-sm font-medium text-white transition-colors hover:bg-[#182B65]/90"
                        >
                          Weekly Newsletter
                        </a>
                      )}
                    </div>

                    <a
                      href={group.mapUrl}
                      className="mt-4 inline-block rounded-md bg-accent px-6 py-2 text-sm font-medium text-white transition-colors hover:bg-accent/90"
                      target="_blank"
                      rel="noreferrer"
                    >
                      Open in Google Maps
                    </a>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Inactive Groups */}
      {inactiveGroups.length > 0 && (
        <section className="bg-[#29324d] py-12">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <h3 className="mb-8 text-sm font-semibold uppercase tracking-wider text-white/70">
              Inactive Groups
            </h3>

            <div className="space-y-8">
              {inactiveGroups.map((group) => (
                <div key={group.id} className="overflow-hidden rounded-lg bg-[#363d54]">
                  <div className="grid md:grid-cols-3">
                    <div className="md:col-span-1">
                      <img
                        src={group.image}
                        alt={group.name}
                        className="h-48 w-full object-cover opacity-75 md:h-full"
                      />
                    </div>
                    <div className="p-6 md:col-span-2">
                      <h4 className="text-2xl font-bold text-white">{group.name}</h4>
                      <p className="mt-1 text-sm text-white/70">{group.meetingTime}</p>
                      <p className="mt-4 text-white/90">{group.description}</p>

                      <div className="mt-4 space-y-2 text-sm text-white/70">
                        <p>
                          <span className="font-medium text-white/90">Location:</span>{' '}
                          {group.location}
                        </p>
                        <p>{group.address}</p>
                      </div>

                      <div className="mt-4">
                        <p className="text-sm text-white/60">For more information:</p>
                        <img
                          src={group.contactImage}
                          alt="Contact email"
                          className="mt-1 h-[45px] w-auto opacity-50"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}
    </div>
  )
}
