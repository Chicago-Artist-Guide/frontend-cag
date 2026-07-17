import fs from 'fs';
import path from 'path';
import React from 'react';
import { render, screen } from '@testing-library/react';
import { renderToStaticMarkup, renderToString } from 'react-dom/server';
import styled from 'styled-components';
import { vi } from 'vitest';

const registryMocks = vi.hoisted(() => ({
  insertedHtmlCallbacks: [] as Array<() => React.ReactNode>
}));

vi.mock('next/navigation', () => ({
  useServerInsertedHTML: (callback: () => React.ReactNode) => {
    registryMocks.insertedHtmlCallbacks.push(callback);
  }
}));

import StyledComponentsRegistry from './styled-components-registry';

const FirstRequestMarker = styled.div`
  color: rgb(1, 2, 3);
`;
const SecondRequestMarker = styled.div`
  color: rgb(4, 5, 6);
`;

const flushMarkup = (callback: () => React.ReactNode) =>
  renderToStaticMarkup(<>{callback()}</>);

describe('StyledComponentsRegistry', () => {
  beforeEach(() => {
    registryMocks.insertedHtmlCallbacks.length = 0;
  });

  it('keeps request-local sheets and flushes each style batch exactly once', () => {
    vi.stubGlobal('window', undefined);

    try {
      renderToString(
        <StyledComponentsRegistry>
          <FirstRequestMarker>first request</FirstRequestMarker>
        </StyledComponentsRegistry>
      );
      expect(registryMocks.insertedHtmlCallbacks).toHaveLength(1);

      const firstFlush = flushMarkup(registryMocks.insertedHtmlCallbacks[0]);
      expect(firstFlush).toMatch(/color:rgb\(1,\s*2,\s*3\)/);
      expect(firstFlush.match(/color:rgb\(1,\s*2,\s*3\)/g)).toHaveLength(1);
      expect(flushMarkup(registryMocks.insertedHtmlCallbacks[0])).not.toMatch(
        /color:rgb\(1,\s*2,\s*3\)/
      );

      renderToString(
        <StyledComponentsRegistry>
          <SecondRequestMarker>second request</SecondRequestMarker>
        </StyledComponentsRegistry>
      );
      expect(registryMocks.insertedHtmlCallbacks).toHaveLength(2);

      const secondFlush = flushMarkup(registryMocks.insertedHtmlCallbacks[1]);
      expect(secondFlush).toMatch(/color:rgb\(4,\s*5,\s*6\)/);
      expect(secondFlush).not.toMatch(/color:rgb\(1,\s*2,\s*3\)/);
    } finally {
      vi.unstubAllGlobals();
    }
  });

  it('uses the documented lazy sheet and streamed flush lifecycle', () => {
    const source = fs.readFileSync(
      path.resolve(__dirname, 'styled-components-registry.tsx'),
      'utf8'
    );

    expect(source).toMatch(
      /useState\(\s*\(\)\s*=>\s*new ServerStyleSheet\(\)\s*\)/
    );
    expect(source).toContain('useServerInsertedHTML(() => {');
    expect(source).toContain('getStyleElement()');
    expect(source).toContain('instance.clearTag()');
    expect(source).toMatch(
      /typeof window !== 'undefined'[\s\S]*return <>{children}<\/>[\s\S]*<StyleSheetManager/
    );
  });

  it('renders browser children without sending styles through the server sheet', () => {
    render(
      <StyledComponentsRegistry>
        <FirstRequestMarker>browser child</FirstRequestMarker>
      </StyledComponentsRegistry>
    );

    expect(screen.getByText('browser child')).toBeTruthy();
    expect(registryMocks.insertedHtmlCallbacks).toHaveLength(1);
    expect(flushMarkup(registryMocks.insertedHtmlCallbacks[0])).not.toMatch(
      /color:rgb\(1,\s*2,\s*3\)/
    );
  });
});
