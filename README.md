# application-load-balancer-visual

An animated, beginner-friendly diagram of the **AWS Application Load Balancer (ALB)**, continuing Ravi's online-shop story. Ravi's shop gets busy, so a receptionist (the ALB) shares visitors between several web servers so that no single server is overloaded.

**#Buildwithvinit** · Plain HTML, CSS and JavaScript · No dependencies · No build step

## AWS ALB concepts in Ravi's words

| Concept | Ravi's world |
|---|---|
| Route 53 | Phone book that turns the shop name into an address |
| Application Load Balancer | Receptionist who greets every customer |
| Listener (80 / 443) | The doors she listens at, plus the rules she follows |
| Target group | The team of web servers in the back |
| EC2 instance | One member of staff (a web server) |
| Availability Zone | A separate building, so one problem cannot stop the shop |
| Health check | "Are you OK?" asked regularly |
| Auto Scaling Group | Automatically hiring extra help |
| Security group | Door guard |
| TLS termination | The secure conversation ends at the receptionist |
| CloudWatch | The monitor that watches everything |

## The 9 steps

1. **Visitors**: customers reach the shop through the internet.
2. **DNS**: Route 53 resolves the domain to the load balancer (alias record).
3. **Application Load Balancer**: the receptionist accepts HTTP and HTTPS requests.
4. **Listener**: ports 80 and 443; rules have conditions and actions (forward, redirect, fixed response).
5. **Target Group**: two EC2 web servers in two Availability Zones.
6. **Traffic Distribution**: requests are spread across healthy servers (round robin; cross-zone on by default).
7. **Health Checks**: a server turns unhealthy and new requests go only to healthy ones.
8. **Scaling**: an Auto Scaling Group adds Web server 3, which joins after passing health checks.
9. **Complete Architecture**: security groups, HTTPS/TLS termination at the ALB and CloudWatch monitoring.

## Interactivity

Play (advances every 5 seconds), Pause, Reset and step selection. From step 5 onward, **Simulate EC2 failure** fails Web server 2 and traffic reroutes to healthy servers. Press **Run health check on Web server 2** to restore it after a simulated passing check.

## Moving-object legend

| Object | Meaning |
|---|---|
| Envelope | Incoming HTTP request |
| Shopping cart | Customer request |
| Green check | Healthy target |
| Red cross | Unhealthy target |
| Package | Server response |
| Shield | HTTPS security |
| Chart | Monitoring activity |

Colours: blue = internet and DNS, teal = ALB, gold = listeners, purple = target groups, green = healthy, red = unhealthy.

## Run locally

```bash
cd application-load-balancer-visual
python3 -m http.server 8000
# open http://localhost:8000
```

## Deploy to GitHub Pages

1. Push these files to the `main` branch of a GitHub repository.
2. Open **Settings > Pages**, choose **Deploy from a branch**, select `main` and `/ (root)`, then Save.
3. Your site is live at `https://YOUR-USERNAME.github.io/REPO-NAME/`.

## Project structure

```
application-load-balancer-visual/
  index.html     layout: sidebar, controls, legend, SVG stage, caption card
  css/style.css  themes, layout, glow animation, responsive rules
  js/app.js      paths, components, moving objects, step text, controls
  .nojekyll
  LICENSE        MIT
  README.md
```

## Customization

Everything is in `js/app.js`: step text in `STEPS`, diagram parts in `COMPS` (`s` = first step shown), routes in `PATHS` (1100 x 620 viewBox), moving objects in `movers()` / `traffic()`, and server positions in `SERVERS`. Colours are in `C` and in the CSS variables. Reduced-motion users see static objects.

## License

MIT. Built with #Buildwithvinit.
