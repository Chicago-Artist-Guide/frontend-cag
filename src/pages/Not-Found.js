import React from 'react';
import Container from 'react-bootstrap/Container';

function NotFound() {
  return (
      <Container className="margin-container whole-screen">
          <div align="center">
            <h1 className="title">THIS PAGE IS NOT AVAILABLE</h1>
            <h2>Return to <a href="/">Chicago Artist Guide</a></h2>
            <div className="mt-5">
            <h3 className="subtitle"> 
            "Memory, all alone in the moonlight, I can smile at the old days, I was beautiful then. 
            I remember the time I knew what happiness was, let the memory live again."
            </h3>
            <h3 className="subtitle"> 
            Cats
            </h3>
            </div>
          </div>
      </Container>
);
}

export default NotFound;
