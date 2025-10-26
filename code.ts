// FigJam Mind Map with beautiful UI and dynamic font sizing
figma.showUI(__html__, { width: 540, height: 800 });

interface TreeNode {
  name: string;
  children?: TreeNode[];
  indent?: number;
  has_last?: boolean;
}

// Listen for UI messages
figma.ui.onmessage = async (msg) => {
  if (msg.type === 'import') {
    try {
      await createMindMap(msg.data);
      figma.notify('Mind map created successfully!');
      figma.closePlugin();
    } catch (error: any) {
      figma.notify('Error: ' + error.message);
    }
  }
};

figma.on('run', async ({ command }: RunEvent) => {
  if (command === 'importMindMap') {
    // UI will show automatically
  }
});

async function createMindMap(data: TreeNode[]) {
  console.log('Starting mind map creation with', data.length, 'nodes');
  // JSON is already a tree structure - no need to build!
  // Just use it directly
  const treeData = data;
  console.log('Using existing tree structure with', treeData.length, 'root nodes');

  // Calculate maximum depth of tree
  function getMaxDepth(nodes: TreeNode[], currentDepth: number = 0): number {
    if (!nodes || nodes.length === 0) return currentDepth;
   
    let maxDepth = currentDepth;
    nodes.forEach(node => {
      if (node.children && node.children.length > 0) {
        const childDepth = getMaxDepth(node.children, currentDepth + 1);
        maxDepth = Math.max(maxDepth, childDepth);
      }
    });
   
    return maxDepth;
  }

  // Calculate tree depth
  const maxDepth = getMaxDepth(treeData);
  console.log('Max tree depth:', maxDepth);

  // Dynamic font size settings - scaled up dramatically with steeper gradient
  const maxFontSize = 600;
  const minFontSize = 60;
  const power = 0.5; // Power <1 for steeper initial drop (dramatic size decrease early)

  function getFontSize(level: number): number {
    if (maxDepth === 0) return maxFontSize;
    const normalizedLevel = Math.pow(level / maxDepth, power);
    const fontSize = maxFontSize - ((maxFontSize - minFontSize) * normalizedLevel);
    return Math.max(minFontSize, Math.round(fontSize));
  }

  // Accurate node dimensions using temporary text measurement
  async function getNodeDimensions(text: string, fontSize: number): Promise<{width: number, height: number}> {
    const tempText = figma.createText();
    tempText.characters = text;
    tempText.fontName = { family: "Inter", style: "Medium" };
    tempText.fontSize = fontSize;
    tempText.fills = [{ type: 'SOLID', color: { r: 0.1, g: 0.1, b: 0.1 } }];
    const textWidth = tempText.width;
    const textHeight = tempText.height;
    tempText.remove();
    const paddingX = 40;
    const paddingY = 20;
    const minWidth = 200;
    const width = Math.max(minWidth, textWidth + 2 * paddingX);
    const minHeight = 140;
    const height = Math.max(minHeight, textHeight + 2 * paddingY);
    return { width, height };
  }

  const centerX = figma.viewport.center.x;
  const centerY = figma.viewport.center.y;
  const horizontalSpacing = 1000; // Increased for larger nodes
  const verticalSpacing = 500; // Increased for taller nodes

  await figma.loadFontAsync({ family: "Inter", style: "Medium" });

  const colors = [
    { r: 0.95, g: 0.95, b: 0.95 },
    { r: 1, g: 0.71, b: 0.76 },
    { r: 0.68, g: 0.85, b: 0.9 },
    { r: 0.56, g: 0.93, b: 0.56 },
    { r: 1, g: 0.85, b: 0.73 },
    { r: 0.9, g: 0.8, b: 1 },
    { r: 1, g: 0.95, b: 0.6 },
  ];

  const allShapes: ShapeWithTextNode[] = [];
  const connectorsToCreate: { parentId: string; childId: string; }[] = [];

  async function createShape(text: string, x: number, y: number, level: number, dims: {width: number, height: number}): Promise<ShapeWithTextNode> {
    const fontSize = getFontSize(level);
    const shape = figma.createShapeWithText();
    shape.x = x;
    shape.y = y;
    shape.resize(dims.width, dims.height);
    shape.fills = [{ type: 'SOLID', color: colors[level % colors.length] }];
    shape.strokes = [{ type: 'SOLID', color: { r: 0.7, g: 0.7, b: 0.7 } }];
    shape.strokeWeight = 2;
    shape.shapeType = 'ROUNDED_RECTANGLE';
    shape.text.characters = text;
    shape.text.fontSize = fontSize;
    shape.text.fontName = { family: "Inter", style: "Medium" };
    shape.text.fills = [{ type: 'SOLID', color: { r: 0.1, g: 0.1, b: 0.1 } }];
    console.log(`Node: "${text}" (Level ${level}) - Font: ${fontSize}px, Size: ${dims.width}x${dims.height}`);
    figma.currentPage.appendChild(shape);
    allShapes.push(shape);
    return shape;
  }

  async function calculateSubtreeWidth(node: TreeNode, level: number): Promise<number> {
    const fontSize = getFontSize(level);
    const dims = await getNodeDimensions(node.name, fontSize);
   
    if (!node.children || node.children.length === 0) {
      return dims.width;
    }
    let totalChildWidth = 0;
    for (const child of node.children) {
      totalChildWidth += await calculateSubtreeWidth(child, level + 1);
    }
    totalChildWidth += Math.max(0, node.children.length - 1) * horizontalSpacing;
    return Math.max(dims.width, totalChildWidth);
  }

  async function layoutTree(node: TreeNode, x: number, y: number, level: number): Promise<ShapeWithTextNode> {
    const fontSize = getFontSize(level);
    const dims = await getNodeDimensions(node.name, fontSize);
    const shape = await createShape(node.name, x, y, level, dims);
   
    if (node.children && node.children.length > 0) {
      const childY = y + dims.height + verticalSpacing;
      const childWidths: number[] = await Promise.all(
        node.children.map(child => calculateSubtreeWidth(child, level + 1))
      );
      let totalChildWidth = childWidths.reduce((sum, w) => sum + w, 0);
      totalChildWidth += Math.max(0, node.children.length - 1) * horizontalSpacing;
      let childSubtreeLeftX = x + (dims.width / 2) - (totalChildWidth / 2);
      for (let i = 0; i < node.children.length; i++) {
        const child = node.children[i];
        const childWidth = childWidths[i];
        const childFontSize = getFontSize(level + 1);
        const childDims = await getNodeDimensions(child.name, childFontSize);
        const childNodeLeftX = childSubtreeLeftX + (childWidth / 2) - (childDims.width / 2);
        const childShape = await layoutTree(child, childNodeLeftX, childY, level + 1);
        connectorsToCreate.push({
          parentId: shape.id,
          childId: childShape.id
        });
        childSubtreeLeftX += childWidth + horizontalSpacing;
      }
    }
    return shape;
  }

  if (treeData && treeData.length > 0) {
    const rootWidths: number[] = await Promise.all(
      treeData.map(rootNode => calculateSubtreeWidth(rootNode, 0))
    );
    let totalRootWidth = rootWidths.reduce((sum, w) => sum + w, 0);
    totalRootWidth += Math.max(0, treeData.length - 1) * horizontalSpacing * 2;
    let rootSubtreeLeftX = centerX - (totalRootWidth / 2);
    const rootY = centerY - 400;
    for (let i = 0; i < treeData.length; i++) {
      const rootNode = treeData[i];
      const rootWidth = rootWidths[i];
      const rootFontSize = getFontSize(0);
      const rootDims = await getNodeDimensions(rootNode.name, rootFontSize);
      const rootNodeLeftX = rootSubtreeLeftX + (rootWidth / 2) - (rootDims.width / 2);
      await layoutTree(rootNode, rootNodeLeftX, rootY, 0);
      rootSubtreeLeftX += rootWidth + horizontalSpacing * 2;
    }
  }

  connectorsToCreate.forEach((conn) => {
    const connector = figma.createConnector();
    connector.connectorLineType = 'ELBOWED';
    connector.connectorStart = {
      endpointNodeId: conn.parentId,
      magnet: 'BOTTOM'
    };
    connector.connectorEnd = {
      endpointNodeId: conn.childId,
      magnet: 'TOP'
    };
    connector.strokeWeight = 4;
    connector.strokes = [{ type: 'SOLID', color: { r: 0.6, g: 0.6, b: 0.6 } }];
  });

  if (allShapes.length > 0) {
    figma.viewport.scrollAndZoomIntoView(allShapes);
  }
  figma.notify(`✅ ${allShapes.length} nodes, ${connectorsToCreate.length} connectors`);
}