import React, { useState, useEffect } from 'react';
import Map from './components/Map';
import ProtestList from './components/ProtestList';
import getDistance from 'geolib/es/getDistance';
import styled from 'styled-components';
import firebase, { firestore } from './firebase';
import * as geofirestore from 'geofirestore';

const GeoFirestore = geofirestore.initializeApp(firestore);

const defaultPosition = [31.775028, 35.217614];

function App() {
  const [coordinates, setCoordinates] = useState(defaultPosition);
  const [loading, setLoading] = useState(true);
  const [protests, setProtests] = useState([]);

  useEffect(() => {
    const geocollection = GeoFirestore.collection('protests');
    const query = geocollection.near({ center: new firebase.firestore.GeoPoint(coordinates[0], coordinates[1]), radius: 20 });
    async function fetchProtests() {
      try {
        const snapshot = await query.limit(10).get();
        const protests = snapshot.docs.map((doc) => {
          const protestLatlng = [doc.data().g.geopoint.latitude, doc.data().g.geopoint.longitude];
          return {
            id: doc.id,
            latlng: protestLatlng,
            distance: getDistance(coordinates, protestLatlng),
            ...doc.data(),
          };
        });

        setProtests(protests);
        setLoading(false);
      } catch (err) {
        console.log(err);
      }
    }
    fetchProtests();
  }, [coordinates]);

  useEffect(() => {
    navigator.geolocation.getCurrentPosition((event) => {
      setCoordinates([event.coords.latitude, event.coords.longitude]);
    });
  }, []);

  let closeProtests = [],
    farProtests = [];

  if (protests.length > 0) {
    closeProtests = protests.filter((p) => p.distance <= 1000).sort((p1, p2) => p1.distance - p2.distance);
    farProtests = protests.filter((p) => p.distance > 1000).sort((p1, p2) => p1.distance - p2.distance);
  }

  return (
    <AppWrapper>
      <Header>
        <SiteLogo>קילומטר אחד</SiteLogo>
        <NavItem href="https://forms.gle/oFXS1qQtY2FyYbLA6" target="blank">
          + הוספת הפגנה
        </NavItem>
      </Header>
      <HomepageWrapper>
        <Map position={coordinates} protests={[...closeProtests, ...farProtests]}></Map>
        <ProtestListWrapper>
          <ProtestList closeProtests={closeProtests} farProtests={farProtests} loading={loading} />
          <Footer>
            <FooterLink href="https://github.com/guytepper/1km" target="_blank">
              <FooterLinkIcon src="/icons/github.svg" alt="Github Repo" />
              גיטהאב
            </FooterLink>
            <FooterLink href="mailto:guytepper@gmail.com" target="_blank">
              <FooterLinkIcon src="/icons/email.svg" alt="Github Repo" />
              פידבק
            </FooterLink>
          </Footer>
        </ProtestListWrapper>
      </HomepageWrapper>
    </AppWrapper>
  );
}

const AppWrapper = styled.div`
  display: grid;
  grid-template-rows: 60px 1fr;
  min-height: 100vh;
`;

const Header = styled.header`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 25px;
  grid-row: 1;
  background-color: #fff;
  box-shadow: inset 0 -1px 0 #e1e4e8;
`;

const SiteLogo = styled.h1`
  font-size: 26px;
`;

const NavItem = styled.a`
  &:hover {
    color: #3498db;
  }
`;

const HomepageWrapper = styled.div`
  height: 100%;
  display: grid;
  grid-row: 2;

  @media (min-width: 768px) {
    grid-template-columns: 280px 1fr;
    grid-template-rows: 1fr;
  }

  @media (min-width: 1024px) {
    grid-template-columns: 300px 1fr;
  }

  @media (min-width: 1280px) {
    grid-template-columns: 330px 1fr;
  }

  @media (min-width: 1700px) {
    grid-template-columns: 375px 1fr;
  }
`;

const ProtestListWrapper = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  grid-column: 1 / 2;
  grid-row: 2;

  @media (min-width: 768px) {
    grid-row: 1;
    padding: 0 15px;
  }
`;

const Footer = styled.footer`
  display: flex;
  align-items: center;
  padding: 15px;
  opacity: 0.6;
  justify-content: flex-end;

  @media (min-width: 768px) {
    padding: 10px 0;
    justify-content: flex-start;
  }
`;

const FooterLink = styled.a`
  display: flex;
  align-items: center;
  padding: 0 5px;
  font-size: 14px;
`;

const FooterLinkIcon = styled.img`
  width: 17.5px;
  margin-inline-end: 5px;
`;

export default App;
