---
title: How The JAM Stack Can Drive Scalability
published: true
description: Static sites
cover_image: https://images.unsplash.com/photo-1525604885849-bb72cf86832c?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=1000&q=80
tags: gatsby, rails, netlify
---


For those who've worked on high-traffic sites built in Ruby on Rails, Node, or any other platform, a riddle: 

> A site for (frequently updated) COVID-19 data had an average daily load of 100,000 users. On a single day, after a White House mention, it spiked to 1.2 million users. It never errored out or fell over, and its all-volunteer team never encountered a huge hosting bill for that day. _What technologies was it built in?_

_Source: [The Covid Tracking Project](https://jamstackconfvirtual.sched.com/event/cES0/the-covid-tracking-project-0-to-2m-api-requests-in-3-months)_

You must be running through the AWS service catalog in your head now, or thinking of Postgres optimizations. You must be thinking Kubernetes must be involved, or at least Docker or Elastic Compute. You probably were not thinking the real answer: Google Drive Sheets and GatsbyJS, hosted on Netlify. The JAM Stack of JavaScript, APIs and Markup.

It's not easy, with the current 'standard' set of web technologies, to produce something that scalable in only 3 months. If you started at the beginning with Rails and MySQL, even with Redis, caching, or a screaming Postgres, how many months would you have to iterate upon before you could reach that level? More than 3 I would say. And more importantly - why does it seem that an order of magnitude of more challenges lie in the way of the standard MVC based web site that are simply not an issue with the JAM Stack? Why is caching and caring for high-volume databases hard, but pushing daily updates of files built from Google Sheets so simple that an all-distributed, all-volunteer team can do it with little ramp-up?

I think one of the biggest architectural choices that impacts this decision is articulated by Martin Kleppman in [Turning The Database Inside Out](https://www.confluent.io/blog/turning-the-database-inside-out-with-apache-samza/). He talks about the concept of the materialized view as a DB construct that dodges the notoriously hard problem of cache invalidation completely. Sure the materialized view is a 'cache', as is a static site like a JAM Stack one, but it relates to its upstream very differently - it is maintained by the database **server**, whereas a cache is maintained by a client. With a materialized view, the client selects from it, and through magic that the client need not know about, it gets a fast place to query. The client doesn't have to ask whether the view is up to date - it just trusts that it sees "the latest" - at least up to the point that transaction isolation and the [CAP Thorem](https://en.wikipedia.org/wiki/CAP_theorem) allow for. The point is - when a client can trust the server to do some work for it, the net complexity (or modularity, or failure-proneness) of the system **may** go down.

The reason this happens has to do with the [Dependency Inversion](https://deviq.com/dependency-inversion-principle/) principle. When you build sites the MVC/Rails/Node way your site code depends on the database.


![Regular Web Flow](https://dev-to-uploads.s3.amazonaws.com/i/ss55toqhye6dun3tkjxi.png)

Whereas in the JAM Stack, the dependency arrows follow the flow of data instead of a flow of 'requests'.
 
![JAM Stack Flow](https://dev-to-uploads.s3.amazonaws.com/i/1bsqiah0wfi2h6qqo4bl.png)

The front-end is "built from" the database but it does not _"query"_ the database. Like a Materialized View, or a Gatsby static site.

The sheer amount of differences of these two architectures is hard to appreciate from just these diagrams, but if you've felt the pain of a front-end needing to both query a database, and a cache, reconcile and coordinate differences in their answers, and keep the cache up to date, you'll understand how much momentum is sapped by having to do that part of the process manually. We need to use computers to automate away this work as much as possible.

It's what the [Reactive Manifesto](https://www.reactivemanifesto.org/) tries to address - we need systems that are Reactive to data changes. If we can point the arrows **toward** our users, turning the database inside out, we can empower ourselves to better address their needs on a timeline that balances our needs with their important demands. Users may not directly care about our need for reliability, simplicity, or our delivery schedules, but we need to care about those if we are going to help them.

And sometimes the way to best help them is by saying Google Sheets is good enough, and then dropping it into the correct place of an architecture where it will not be a bottleneck. And then you can push out life-saving data without even having to start from or even involve a relational database. Except through JavaScript, APIs, and Markup. The JAM Stack.

Yes, sometimes companies want to pay for literally up-to-the-second live data - in which case you have this set of challenges that doesn't exist with static sites. True. So it's not an apples to apples comparison. But it's a provocative way to question what points we start from - because eventually we may be bound by those decisions, and it's good to know when picking an architecture a) what are your current choices and b) what are their possible, or eventual failure modes.

-Dean

---
Resources:

- [The Covid Tracking Project](https://jamstackconfvirtual.sched.com/event/cES0/the-covid-tracking-project-0-to-2m-api-requests-in-3-months)
- [Turning The Database Inside Out](https://www.confluent.io/blog/turning-the-database-inside-out-with-apache-samza/)
- [CAP Thorem](https://en.wikipedia.org/wiki/CAP_theorem)
- [Dependency Inversion](https://deviq.com/dependency-inversion-principle/)
- [Reactive Manifesto](https://www.reactivemanifesto.org/)


