'use client';

import React from 'react';
import { Container, Row, Col } from 'react-bootstrap';
// import styles from './_styles/mainFooter.module.css';
// import styles from '../_styles/mainFooter.module.css';
import styles from './_styles/mainFooter.module.scss';
// import styles from 

const MainFooter: React.FC = () => {
return (    
    <footer className={styles.footer}>
				<Container>
					<Row>
						<Col lg={4} md={6} className={styles.footerBrand}>
							<h3 className={styles.footerLogo}>IvyBrilliance</h3>
							<p>
								Continuing education for everyone. Learn at your own pace with
								expert-led courses designed for real-world skills.
							</p>
							{/* <div className={styles.socialIcons}>
								<a href="#" aria-label="Facebook">
									<i className="fab fa-facebook-f"></i>
								</a>
								<a href="#" aria-label="Twitter">
									<i className="fab fa-twitter"></i>
								</a>
								<a href="#" aria-label="Instagram">
									<i className="fab fa-instagram"></i>
								</a>
								<a href="#" aria-label="LinkedIn">
									<i className="fab fa-linkedin-in"></i>
								</a>
							</div> */}
						</Col>

						<Col lg={2} md={6} sm={6} className={styles.footerLinks}>
							<h4>Explore</h4>
							<ul>
								<li>
									<a href="/courses">All Courses</a>
								</li>
								<li>
									<a href="/tutoring">Tutoring</a>
								</li>
								{/* <li>
									<a href="/pricing">Pricing</a>
								</li> */}
								<li>{/* <a href="/enterprise">For Enterprise</a> */}</li>
							</ul>
						</Col>

						<Col lg={2} md={6} sm={6} className={styles.footerLinks}>
							<h4>Resources</h4>
							<ul>
								{/* <li>
									<a href="/blog">Blog</a>
								</li> */}
								<li>
									<a href="/courses">Tutorials</a>
								</li>
								<li>{/* <a href="/webinars">Webinars</a> */}</li>
								{/* <li>
									<a href="/community">Community</a>
								</li> */}
							</ul>
						</Col>

						<Col lg={2} md={6} sm={6} className={styles.footerLinks}>
							<h4>Company</h4>
							<ul>
								<li>
									<a href="/about">About Us</a>
								</li>
								{/* <li>
									<a href="/careers">Careers</a>
								</li> */}
								<li>{/* <a href="/press">Press</a> */}</li>
								<li>
									<a href="/contact">Contact Us</a>
								</li>
							</ul>
						</Col>

						<Col lg={2} md={6} sm={6} className={styles.footerLinks}>
							<h4>Legal</h4>
							<ul>
								<li>
									<a href="/terms">Terms of Service</a>
								</li>
								<li>
									<a href="/privacy">Privacy Policy</a>
								</li>
								{/* <li>
									<a href="/cookies">Cookie Policy</a>
								</li> */}
								<li>{/* <a href="/accessibility">Accessibility</a> */}</li>
							</ul>
						</Col>
					</Row>

					<div className={styles.footerBottom}>
						<p>&copy; {new Date().getFullYear()} IvyBrilliance. All rights reserved.</p>
						{/* <div className={styles.footerBottomLinks}>
							<a href="/help">Help Center</a>
							<a href="/sitemap">Sitemap</a>
						</div> */}
					</div>
				</Container>
			</footer>
);
}
export default MainFooter;
